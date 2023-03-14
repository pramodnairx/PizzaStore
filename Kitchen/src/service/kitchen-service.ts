import 'reflect-metadata';
import config from 'config'; 
import { Order, OrderStatus } from '../model/order';
import { PersistenceManager } from '../db/persistencemanager';
import { logger } from '../util/utils';
import {setTimeout} from "timers/promises";

class KitchenService {

    public constructor(private persistenceManager: PersistenceManager) {}

    public async processOrder(order: Order) : Promise<Order> {
        if(order.status === OrderStatus.Acknowledged) {
            logger.info(`Kitchen says Ack order receieved = ${JSON.stringify(order)}`);            
            //Check for duplicates processed by other Kitchen Service instances
            if (await this.persistenceManager.getOrder(order.orderID)) {
                logger.warn(`Kitchen say Order ID ${order.orderID} is already being processed. Received a duplicate order. Ignoring.`);
            } else {
                await this.persistenceManager.saveOrders([order]);
                let msToWait = Math.random() * 10000;
                logger.info(`Kitchen says the Order ${order.orderID} will take ${msToWait / 1000} seconds to prepare`);
                order.status = OrderStatus.Processing;
                
                await setTimeout(msToWait);
                
                logger.info(`Kitchen says the Order ${order.orderID} is now ready`);
                order.status = OrderStatus.Ready;
                await this.persistenceManager.updateOrder(order);
            }
        } else {
            logger.info(`Kitchen ignoring an Order with status ${order.status}`);
        }

        return order;
    }
}

export { KitchenService }