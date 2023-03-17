import config from 'config'; 
import { Order } from '../../model/order';
import { logger } from '../../util/utils';
import { Kafka, KafkaJSNonRetriableError } from 'kafkajs';
import { KitchenService } from '../kitchen-service';
import { PersistenceManager, TYPES } from '../../db/persistencemanager';
import { iocContainer } from "../../inversify.config";

class KitchenServiceKafkaAdapter {

    private static initialized = false;

    private kitchen: KitchenService | undefined;
    
    private kafka = new Kafka({
        clientId: config.get(`kitchenService.messaging.kafka.client-id`),
        brokers: config.get(`kitchenService.messaging.kafka.brokers`),
        connectionTimeout: 20000
    });

    public static isInitialized() {
        return KitchenServiceKafkaAdapter.initialized;
    }

    public async init() {
        if(!KitchenServiceKafkaAdapter.isInitialized()) {
            logger.info(`Kitchen Service Kafka Adapter being initialized`);

            const pm = iocContainer.get<PersistenceManager>(TYPES.PersistenceManager);
            this.kitchen = new KitchenService(pm);
            logger.info(`Kitchen Service Kafka Adapter - DB initialized`);

            //@TODO : Should not be this components responsibility
            /*
            const admin = this.kafka.admin();
            let retries = 0;
            let adminConnected = false;
            while(!adminConnected) {
                try {
                    await admin.connect();
                    adminConnected = true;
                } catch(err) {
                    if(err instanceof KafkaJSNonRetriableError && err.name === 'KafkaJSNumberOfRetriesExceeded') {
                        logger.info(`Service will retry Kafka Admin connection [${10 - retries - 1}] more times`);
                        retries++;
                        if(retries === 10)
                            throw err;
                    } else {
                        logger.info(`Service exception while Admin connect - ${err}`);
                        throw err;
                    }
                }
            }

            logger.info(`Kitchen Service Kafka Adapter - Kafka admin connected`);
            if (!((await admin.listTopics()).includes(config.get(`kitchenService.messaging.kafka.orders-topic`)))) {
                await admin.createTopics({
                    waitForLeaders: true,
                    topics: [
                      { topic: config.get(`kitchenService.messaging.kafka.orders-topic`) },
                    ],
                  });
                logger.info(`Kitchen Service Kafka Adapter created topic ${config.get(`kitchenService.messaging.kafka.orders-topic`)}`);
            }
            await admin.disconnect();
            */

            let consumer = this.kafka.consumer({groupId: 
                            `${config.get("kitchenService.messaging.kafka.group-id")}`});
            await consumer.connect();
            await consumer.subscribe({topic: `${config.get(`kitchenService.messaging.kafka.orders-topic`)}`, fromBeginning: true});

            logger.info(`Kitchen Service Kafka Adapter subscribed to topic`);
            
            await consumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    if (this.kitchen) {
                        let msgValue = message.value?.toString();
                        logger.info(`Kitchen Service Kafka Adapter processing incoming ${msgValue}`);
                        if(msgValue) {
                            let order = await this.kitchen.processOrder(JSON.parse(msgValue));
                            if(order && order !== null) {
                                this.orderReady(order);
                            }
                        } else {
                            logger.warn(`Empty message received. Ignoring. ${topic} - ${partition} - ${message}`);
                        }
                    } else {
                        logger.warn(`Kithen Service Kafka Adapter - Kitchen service not ready, message being ignored : ${message}`);
                    }
                }
            });

            KitchenServiceKafkaAdapter.initialized = true;

        } else {
            logger.warn(`Request to re-initialize Kitchen Service Kafka Adapter. Ignored. Check code flow.`);
        }
    }

    public async orderReady(order: Order) {
        logger.info(`Kitchen Service Kafka Adapter sending Order ready message ${JSON.stringify(order)}`);
        let producer = this.kafka.producer();
        await producer.connect();
        await producer.send({
            topic: config.get(`kitchenService.messaging.kafka.orders-topic`),
            messages: [
                {
                    key: order.orderID,
                    value: JSON.stringify(order)
                }
            ]
        });
        await producer.disconnect();
        logger.info(`Kitchen Service Kafka Adapter Order ready message sent.`);
    }

}

new KitchenServiceKafkaAdapter().init();

export { KitchenServiceKafkaAdapter }