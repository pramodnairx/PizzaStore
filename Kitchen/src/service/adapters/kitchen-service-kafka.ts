import { instrument, serveMalabiFromHttpApp } from 'malabi';
import config from 'config'; 
import { Consumer, Kafka, KafkaJSNonRetriableError } from 'kafkajs';
import { Order } from '../../model/order';
import { logger } from '../../util/utils';
import { KitchenService } from '../kitchen-service';
import { PersistenceManager, TYPES } from '../../db/persistencemanager';
import { iocContainer } from "../../inversify.config";

const instrumentationConfig = {
    serviceName: 'kitchen-service',
}

class KitchenServiceKafkaAdapter {

    private static initialized = false;

    private kitchen: KitchenService | undefined;
    
    private kafka = new Kafka({
        clientId: config.get(`kitchenService.messaging.kafka.client-id`),
        brokers: config.get(`kitchenService.messaging.kafka.brokers`),
        connectionTimeout: 20000
    });

    /**
     * see https://medium.com/@curtis.porter/graceful-termination-of-kafkajs-client-processes-b05dd185759d
     * however, jaeger seems to be messing this up
     * @param consumer kafkajs consumer
     */
    private setupForCleanShutdown(consumer: Consumer) {
        const errorTypes = ['unhandledRejection', 'uncaughtException']
        const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']
        
        errorTypes.map(type => {
          process.on(type, async e => {
            try {
              logger.info(`process.on ${type}`);
              logger.warn(e);
              await consumer.disconnect();
              process.exit(0);
            } catch (_) {
              process.exit(1);
            }
          })
        })
        
        signalTraps.map(type => {
          process.once(type, async () => {
            try {
              await consumer.disconnect();console.error
            } finally {
              process.kill(process.pid, type);
            }
          })
        })        
    }

    public static isInitialized() {
        return KitchenServiceKafkaAdapter.initialized;
    }

    public async init() {
        if(!KitchenServiceKafkaAdapter.isInitialized()) {
            logger.info(`Kitchen Service Kafka Adapter being initialized`);

            const pm = iocContainer.get<PersistenceManager>(TYPES.PersistenceManager);
            this.kitchen = new KitchenService(pm);
            logger.info(`Kitchen Service Kafka Adapter - DB initialized`);

            let consumer = this.kafka.consumer({groupId: 
                            `${config.get("kitchenService.messaging.kafka.group-id")}`});
            //this.setupForCleanShutdown(consumer);
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
                            logger.warn(`Empty message received. Ignoring (possibly a duplicate order). ${topic} - ${partition} - ${message}`);
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

instrument(instrumentationConfig);
serveMalabiFromHttpApp(18393 //config.get(`kitchenService.instrumentation.malabi-port`)
                        , instrumentationConfig);

new KitchenServiceKafkaAdapter().init();

export { KitchenServiceKafkaAdapter }