import config from 'config'; 
import { logger } from '../../util/utils';
import { Kafka, KafkaJSNonRetriableError } from 'kafkajs';
import { iocContainer } from "../../inversify.config";
import { StoreFrontService } from '../storefront-service';
import { PersistenceManager, TYPES } from '../../db/persistencemanager';

logger.defaultMeta = { service: `Storefront service Kafka adapter`};

const instrumentationConfig = {
    serviceName: 'storefront-service-kafka-adpeter',
}

class StoreFrontServiceKafkaAdapter {

    private static initialized = false;
    
    private storeFront: StoreFrontService | undefined;

    private kafka = new Kafka({
        clientId: config.get(`storefront.messaging.kafka.client-id`),
        brokers: config.get(`storefront.messaging.kafka.brokers`)
    });

    public static isInitialized() {
        return StoreFrontServiceKafkaAdapter.initialized;
    }

    public async init() {
        if(!StoreFrontServiceKafkaAdapter.isInitialized()) {
            logger.info(`Pizza Store Front Service Kafka Adapter being initialized`);

            const admin = this.kafka.admin();
            let retries = 0;
            let adminConnected = false;
            while(!adminConnected) {
                try {
                    await admin.connect();
                    adminConnected = true;
                } catch(err) {
                    if(err instanceof KafkaJSNonRetriableError && err.name === 'KafkaJSNumberOfRetriesExceeded') {
                        logger.info(`Store Front Service will retry Kafka Admin connection [${10 - retries - 1}] more times`);
                        retries++;
                        if(retries === 10)
                            throw err;
                    } else {
                        logger.info(`Store Front Service exception while Admin connect - ${err}`);
                        throw err;
                    }
                }
            }
            logger.info(`Store Front Service Kafka Adapter - Kafka admin connected`);
            
            if (!((await admin.listTopics()).includes(config.get(`storefront.messaging.kafka.orders-topic`)))) {
                await admin.createTopics({
                    waitForLeaders: true,
                    topics: [
                      { topic: config.get(`storefront.messaging.kafka.orders-topic`) },
                    ],
                  });
                logger.info(`Store Front Service Kafka Adapter created topic ${config.get(`storefront.messaging.kafka.orders-topic`)}`);
            }

            await admin.disconnect();

            /*
            const pm = iocContainer.get<PersistenceManager>(TYPES.PersistenceManager);
            this.storeFront = new StoreFrontService(pm);
            logger.info(`Store Front Service Kafka Adapter - DB initialized`);

            let consumer = this.kafka.consumer({groupId: 
                            `${config.get("storefront.messaging.kafka.group-id")}`});
            //this.setupForCleanShutdown(consumer);
            await consumer.connect();
            await consumer.subscribe({topic: `${config.get(`storefront.messaging.kafka.orders-topic`)}`, fromBeginning: true});

            logger.info(`Store Front Service Kafka Adapter subscribed to topic`);
            
            await consumer.run({
                eachMessage: async ({topic, partition, message}) => {
                    if (this.storeFront) {
                        let msgValue = message.value?.toString();
                        logger.info(`Store Front Service Kafka Adapter processing incoming ${msgValue}`);
                        if(msgValue) {
                            let order = await this.storeFront.processOrder(JSON.parse(msgValue));
                            if(order && order !== null) {
                                this.orderReady(order);
                            }
                        } else {
                            logger.warn(`Empty message received. Ignoring (possibly a duplicate order). ${topic} - ${partition} - ${message}`);
                        }
                    } else {
                        logger.warn(`Store Front Service Kafka Adapter - Kitchen service not ready, message being ignored : ${message}`);
                    }
                }
            });
            */

            StoreFrontServiceKafkaAdapter.initialized = true;

        } else {
            logger.warn(`Request to re-initialize Store Front Service Kafka Adapter. Ignored. Check code flow.`);
        }
    }
}

new StoreFrontServiceKafkaAdapter().init();

export { StoreFrontServiceKafkaAdapter }