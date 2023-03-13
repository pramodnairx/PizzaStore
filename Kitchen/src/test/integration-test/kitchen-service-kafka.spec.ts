import chai from 'chai';
import { Order, Pizza, Item, OrderStatus} from '../../model/order';
import config from 'config';
import { Kafka } from 'kafkajs';
import { logger } from '../../util/utils';
import { setTimeout } from 'timers/promises';
import { randomBytes } from 'crypto';
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
              (new class implements Order {orderID = randomBytes(3).toString('hex'); customerName = "Real Wrong Jack"; status = OrderStatus.Ready; customerAddress = "213 Hungryville 3026"; items = [items[0], items[1]] }()) 
            ];
}

describe('Kitchen Service Kafka Adapter Integration Tests', () => {

    let processedOrder0: Order;

    before(async() => {

        await producer.connect();
        await consumer.connect();

        await consumer.subscribe({topic: `${config.get(`kitchenService.messaging.kafka.orders-topic`)}`, fromBeginning: true});
        logger.info(`Integration test : Subscribed to Orders Topic`);
        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                    let msgValue = message.value?.toString();
                    logger.info(`Integration test : message received - ${msgValue}`);
                    if(msgValue) {
                        let order = JSON.parse(msgValue);
                        if (order.status === OrderStatus.Ready && order.orderID === orders[0].orderID) {
                            processedOrder0 = order;
                        } 
                    } else {
                        //Ignore maybe?
                    }
                },
        });

        while(!KitchenServiceKafkaAdapter.isInitialized()) {
            logger.info("Waiting...");
            await setTimeout(config.get('kitchenService.integration-test.result-check-timeout'));
        }
    });

    it('Verify an Acknowledged Order is prepared', async () => { 
        reset();
        await producer.send({
            topic: config.get(`kitchenService.messaging.kafka.orders-topic`),
            messages: [
                {
                    key: orders[0].orderID,
                    value: JSON.stringify(orders[0])
                }
            ]
        });
        logger.info(`Integration test : ACK Order sent.`);
        
        await resultReady(() => {
            if(processedOrder0)
                return true;
            else
                return false;
        }, 
        config.get(`kitchenService.integration-test.result-check-timeout`), 
        config.get(`kitchenService.integration-test.result-check-max-tries`));

        expect(processedOrder0).to.be.not.null;
        expect(processedOrder0.orderID).to.equal(orders[0].orderID);
        expect(processedOrder0.status).to.equal(OrderStatus.Ready);
    });

    after(async() => {
        await producer.disconnect();
        await consumer.disconnect();
        logger.info(`Producer and Consumer disconnected`);
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
