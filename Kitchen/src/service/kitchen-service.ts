import config from 'config'; 
import { Item, Order, OrderStatus, Pizza } from '../model/order';
//import { PersistenceManagerFactory } from '../db/persistencemanager';
import { logger } from '../util/utils';
import { Kafka } from 'kafkajs';
import {setTimeout} from "timers/promises";

class KitchenService {

    private ready = false;

    private kafka = new Kafka({
        clientId: config.get(`kitchenService.messaging.kafka.client-id`),
        brokers: config.get(`kitchenService.messaging.kafka.brokers`)
    });

    async init() {
        let consumer = this.kafka.consumer({groupId: `${config.get("kitchenService.messaging.kafka.group-id")}`});
        await consumer.connect();
        await consumer.subscribe({topic: `${config.get(`orderService.messaging.kafka.order-topic-ack`)}`, fromBeginning: true});
        this.ready = true;
        await consumer.run({
            eachMessage: async ({topic, partition, message}) => {
                console.log({
                    value: message.value?.toString(),
                });
                this.processOrder(message.value?.toString());
            }
        });
    }

    public async processOrder(orderMsg: string | undefined) {
        if(orderMsg) {
            this.prepareOrder(JSON.parse(orderMsg));
        }
    }

    public isReady(){
        return this.ready;
    }

    private async prepareOrder(order: Order) {
        let msToWait = Math.random() * 1000;
        logger.info(`Kitchen says the Order ${order.orderID} will take ${msToWait / 1000} seconds to prepare`);
        order.status = OrderStatus.Processing;
        
        await setTimeout(msToWait);
        
        logger.info(`Kitchen says the Order ${order.orderID} is now ready`);
        order.status = OrderStatus.Ready;
        
        let producer = this.kafka.producer();
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

export { KitchenService }