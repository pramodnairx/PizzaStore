import config from 'config'; 
import { Item, Order, OrderStatus, Pizza } from '../model/order';
//import { PersistenceManagerFactory } from '../db/persistencemanager';
import { logger } from '../util/utils';
import { Kafka } from 'kafkajs';
import {setTimeout} from "timers/promises";

class KitchenService {

    private static ready = false;

    private static kafka = new Kafka({
        clientId: config.get(`kitchenService.messaging.kafka.client-id`),
        brokers: config.get(`kitchenService.messaging.kafka.brokers`)
    });

    static async init() {
        let consumer = KitchenService.kafka.consumer({groupId: `${config.get("kitchenService.messaging.kafka.group-id")}`});
        await consumer.connect();
        await consumer.subscribe({topic: `${config.get(`kitchenService.messaging.kafka.order-topic-ack`)}`, fromBeginning: true});
        KitchenService.ready = true;
        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                console.log({
                    value: message.value?.toString(),
                });
                new KitchenService().processOrder(message.value?.toString());
            }
        });
    }

    private async processOrder(orderMsg: string | undefined) {
        if(orderMsg) {
            this.prepareOrder(JSON.parse(orderMsg));
        }
    }

    private async prepareOrder(order: Order) {
        let msToWait = Math.random() * 10000;
        logger.info(`Kitchen says the Order ${order.orderID} will take ${msToWait / 1000} seconds to prepare`);
        order.status = OrderStatus.Processing;
        
        await setTimeout(msToWait);
        
        logger.info(`Kitchen says the Order ${order.orderID} is now ready`);
        order.status = OrderStatus.Ready;
        
        let producer = KitchenService.kafka.producer();
        await producer.connect();
        await producer.send({
            topic: config.get(`kitchenService.messaging.kafka.order-topic-ready`),
            messages: [
                {
                    key: order.orderID,
                    value: JSON.stringify(order)
                }
            ]
        });
        await producer.disconnect();
    }

}

KitchenService.init();

export { KitchenService }