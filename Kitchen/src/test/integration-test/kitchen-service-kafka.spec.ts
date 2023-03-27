import { malabi, MalabiSpan} from 'malabi';
import { SpanKind } from '@opentelemetry/api';
import { EachMessageHandler, Kafka, Message } from 'kafkajs';
import { setTimeout } from 'timers/promises';
import { randomBytes } from 'crypto';
import chai from 'chai';
import { Order, Pizza, Item, OrderStatus} from '../../model/order';
import config from 'config';
import { logger } from '../../util/utils';
import { KitchenServiceKafkaAdapter } from '../../service/adapters/kitchen-service-kafka';


let expect = chai.expect;

let pizzas: Pizza[];
let items: Item[];
let orders: Order[];

let kafka = new Kafka({
    clientId: config.get(`kitchenService.integration-test.kafka-client-id`),
    brokers: config.get(`kitchenService.messaging.kafka.brokers`)
});
let producer = kafka.producer();
let consumer = kafka.consumer({groupId: config.get(`kitchenService.integration-test.kafka-group-id`)});    

const reset = function() {
    pizzas = [(new class implements Pizza {name = "Margherita"; ingredients = ["Cheese and more cheese"]}()),
                (new class implements Pizza {name = "Meat Feast"; ingredients = ["Bacon", "Salami", "Sausage", "Anchovies"]}()),
                //(new class implements Pizza {name = "Hawaiian"; ingredients = "Pineapple, Prawns";}())
            ];
    
    items = [(new class implements Item{pizza = pizzas[0]; price = 18.95}()),
                (new class implements Item{pizza = pizzas[1]; price = 22.10}())
            ];
    
    orders = [(new class implements Order {orderID = randomBytes(5).toString('hex'); customerName = "Real Hungrier Jack"; status = OrderStatus.Acknowledged; customerAddress = "213 Hungryville 3026"; items = [items[0], items[1]] }()),
              (new class implements Order {orderID = randomBytes(8).toString('hex'); customerName = "Real Wrong Jack"; status = OrderStatus.Ready; customerAddress = "213 Hungryville 3026"; items = [items[0], items[1]] }()) 
            ];
}

describe('Kitchen Service Kafka Adapter Integration Tests', () => {


    it('Verify an Acknowledged Order is prepared', async () => {
        let processedOrder: Order;
        reset();
        const telemetryRepo = await malabi(async() => {
            await setupProducerAndConsumer(config.get(`kitchenService.messaging.kafka.orders-topic`), 
                async ({topic, partition, message}) => {
                    let msgValue = message.value?.toString();
                    logger.debug(`Integration test : message received - ${msgValue}`);
                    if(msgValue) {
                        let order = JSON.parse(msgValue);
                        if (order.status === OrderStatus.Ready && order.orderID === orders[0].orderID) {
                            processedOrder = order;
                        } 
                    }
            });            
            await sendMessage(config.get(`kitchenService.messaging.kafka.orders-topic`), 
                                [
                                    {
                                        key: orders[0].orderID,
                                        value: JSON.stringify(orders[0])
                                    }
                                ]
            );            
            await resultReady(() => {
                    if(processedOrder)
                        return true;
                    else
                        return false;
                }, 
                config.get(`kitchenService.integration-test.result-check-timeout`), 
                config.get(`kitchenService.integration-test.result-check-max-tries`));
                logger.debug(`Integration test : Results ready : Order under test = ${JSON.stringify(processedOrder)}`
            );            
            await tearDownProducerAndConsumer();   
        });

        const allSpans = telemetryRepo.spans.all;
        const kafkaPublishSpans = allSpans.filter((span: MalabiSpan, index) => {
            return (span.messagingSystem 
                    && span.messagingSystem === 'kafka')
                    && span.queueOrTopicName === 'orders' 
                    && span.messagingDestinationKind === 'topic' 
                    && span.kind === SpanKind.PRODUCER;
        });
        const mongoSpans = allSpans.filter((span: MalabiSpan, index) => {
            return span.mongoCollection; 
        });

        //Verify 2 and only 2 messages were produced to the kafka orders topic - one for order ACK and one for order READY
        expect(kafkaPublishSpans.length === 2);

        //Verify that an ACK order was produced
        const publishedOrder0 = JSON.parse(kafkaPublishSpans[0].messagingPayload);
        expect(publishedOrder0).to.be.not.null;
        expect(publishedOrder0.orderID).to.equal(orders[0].orderID);
        expect(publishedOrder0.status).to.equal(OrderStatus.Acknowledged);

        //Verify that a duplicate order search was performed using the correct Order ID and no duplicates were found in the DB search
        expect(mongoSpans.length > 1);
        expect(mongoSpans[0].name).to.equal('mongoose.Order.findOne');
        expect(mongoSpans[0].attribute('db.statement')).to.be.not.null;
        expect(JSON.parse(mongoSpans[0].attribute('db.statement').toString()).condition.orderID).to.equal(orders[0].orderID);
        expect(mongoSpans[0].attribute('db.response')).to.equal("null");

        //Verify that a Ready order was produced
        const publishedOrder1 = JSON.parse(kafkaPublishSpans[1].messagingPayload);
        expect(publishedOrder1).to.be.not.null;
        expect(publishedOrder1.orderID).to.equal(orders[0].orderID);
        expect(publishedOrder1.status).to.equal(OrderStatus.Ready);
    });

    it('Verify a duplicate Order is ignored by the Kitchen service', async () => {
        let processedOrder: Order | undefined;
        let orderID: string;
        reset();
        const telemetryRepo = await malabi(async() => {

            await setupProducerAndConsumer(config.get(`kitchenService.messaging.kafka.orders-topic`), 
                async ({topic, partition, message}) => {
                    let msgValue = message.value?.toString();
                    logger.debug(`Integration test : message received - ${msgValue}`);
                    if(msgValue) {
                        let order = JSON.parse(msgValue);
                        if (order.status === OrderStatus.Ready && order.orderID === orders[0].orderID) {
                            processedOrder = order;
                            orderID = order.orderID;
                        } 
                    }
            });            
            await sendMessage(config.get(`kitchenService.messaging.kafka.orders-topic`), 
                                [
                                    {
                                        key: orders[0].orderID,
                                        value: JSON.stringify(orders[0])
                                    }
                                ]
            );            
            await resultReady(() => {
                    if(processedOrder)
                        return true;
                    else
                        return false;
                }, 
                config.get(`kitchenService.integration-test.result-check-timeout`), 
                config.get(`kitchenService.integration-test.result-check-max-tries`));
                logger.debug(`Integration test : Results ready : Order under test = ${JSON.stringify(processedOrder)}`
            );

            //Duplicate order
            await sendMessage(config.get(`kitchenService.messaging.kafka.orders-topic`), 
                                [
                                    {
                                        key: orders[0].orderID,
                                        value: JSON.stringify(orders[0])
                                    }
                                ]
            );
            await setTimeout(10000); //Giving some time for kafka and kitchen service to process
            
            await tearDownProducerAndConsumer();
        });

        const allSpans = telemetryRepo.spans.all;
        const kafkaPublishSpans = allSpans.filter((span: MalabiSpan, index) => {
            return (span.messagingSystem 
                    && span.messagingSystem === 'kafka')
                    && span.queueOrTopicName === 'orders' 
                    && span.messagingDestinationKind === 'topic' 
                    && span.kind === SpanKind.PRODUCER;
        });
        const mongoSpans = allSpans.filter((span: MalabiSpan, index) => {
            return span.mongoCollection; 
        });

        //Verify 1 and only 1 message was produced to the kafka orders topic - for order ACK. No READY should have been produced
        expect(kafkaPublishSpans.length === 1);

        //Verify that an ACK order was produced
        const publishedOrder0 = JSON.parse(kafkaPublishSpans[0].messagingPayload);
        expect(publishedOrder0).to.be.not.null;
        expect(publishedOrder0.orderID).to.equal(orders[0].orderID);
        expect(publishedOrder0.status).to.equal(OrderStatus.Acknowledged);

        //Verify that a duplicate order search was performed using the correct Order ID and duplicates were found in the DB search
        expect(mongoSpans.length > 2);
        expect(mongoSpans[2].name).to.equal('mongoose.Order.findOne');
        expect(mongoSpans[2].attribute('db.statement')).to.be.not.null;
        expect(JSON.parse(mongoSpans[2].attribute('db.statement').toString()).condition.orderID).to.equal(orders[0].orderID);
        expect(mongoSpans[2].attribute('db.response')).to.not.equal("null");

    });


    async function resultReady(predicate: (a:void) => boolean, timeout: number, maxTries: number) : Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            while(!predicate()) {
                await setTimeout(timeout);
            }
            resolve(true);
        });
    }
});

async function setupProducerAndConsumer(topic: string, consMsgRecvdCallback: EachMessageHandler) {
    await producer.connect();
    await consumer.connect();
    await consumer.subscribe({topic: topic, fromBeginning: true});
    logger.debug(`Integration test : Subscribed to Orders Topic`);
    await consumer.run({
        eachMessage: consMsgRecvdCallback,
    });

    while(!KitchenServiceKafkaAdapter.isInitialized()) {
        logger.info("Waiting for Kitchen Service Kafka Adapter to initalize...");
        await setTimeout(config.get('kitchenService.integration-test.result-check-timeout'));   
    }
}

async function sendMessage(topic: string, messages: Message[]) {
    await producer.send({
        topic: topic,
        messages: messages
    });
}

async function tearDownProducerAndConsumer() {
    await producer.disconnect();
    await consumer.disconnect();
    logger.info(`Producer and Consumer disconnected`);               
}