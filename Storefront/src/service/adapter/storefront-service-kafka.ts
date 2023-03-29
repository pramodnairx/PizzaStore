import config from 'config'; 
import { logger } from '../../util/utils';
import { Kafka, KafkaJSNonRetriableError } from 'kafkajs';

class StoreFrontServiceKafkaAdapter {

    private static initialized = false;
    
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
    
            StoreFrontServiceKafkaAdapter.initialized = true;

        } else {
            logger.warn(`Request to re-initialize Store Front Service Kafka Adapter. Ignored. Check code flow.`);
        }
    }
}

new StoreFrontServiceKafkaAdapter().init();

export { StoreFrontServiceKafkaAdapter }