import { PersistenceManager } from "../db/persistencemanager";
import { Order, OrderStatus } from "../model/order";
import { logger } from './../util/utils';
import config from 'config';

class StoreFrontService {

    public constructor(private persistenceManager: PersistenceManager) {}

    /**
     * Receives an Order with a unique orderID for processing.
     * 
     * @param order Order with Initialized status and a unique orderID
     * @returns An order with Acknowledged status OR an undefined object if duplicate / invalid order received
     */
    public async initiateOrder(order: Order): Promise<Order|undefined> {
        let processedOrder;
        if(order.status && order.status === OrderStatus.Initialized) {
            //check duplicate orders already being processed (maybe another node)
            if (await this.persistenceManager.getOrder(order.orderID)) {
                logger.warn(`Store front say Order ID ${order.orderID} is already being processed. Received a duplicate order. Ignoring.`);
            } else {
                //Change the order status and save it
                order.status = OrderStatus.Acknowledged;
                await this.persistenceManager.saveOrders([order]);
                processedOrder = order;
                logger.debug(`Store front service has initiated processing of Order ${processedOrder.orderID}`);
            }            
        } else {
            logger.warn(`Store front service received an order with status ${order.status}. Ignoring.`);
        }
        return processedOrder;
    }

    public async getOrderStatus(orderID: string): Promise<OrderStatus|undefined> {
        let foundOrderStatus: OrderStatus|undefined;
        if (orderID) {
            let order = await this.persistenceManager.getOrder(orderID);
            if (order) {
                foundOrderStatus = order.status;
            }
        } else {
            throw new Error(`Invalid / Null orderID received for querying status`);
        }
        return foundOrderStatus;
    }

    public async processDeliveredOrder(order: Order) {
        throw new Error(`processDeliveredOrder feature not implemented yet`);
    }

    public async processStockUpdate() {
        throw new Error(`processStockUpdate feature not implemented yet`);
    }

}

export { StoreFrontService }