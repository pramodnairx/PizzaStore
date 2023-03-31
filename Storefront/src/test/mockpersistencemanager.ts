import { injectable, inject } from "inversify";
import 'reflect-metadata';
import { PersistenceManager } from "../db/persistencemanager";
import { Order } from "../model/order";

@injectable()
class MockPersistenceManager implements PersistenceManager {

    // Array order is 0:get, 1:save, 2:delete, 3:update 
    private responseMap: Map<string, Order>[] = [];

    setMockResponses(responseMap: Map<string, Order>[]) {
        this.responseMap = responseMap;
    }

    getOrder(orderID: string): Promise<Order | null> {
        return new Promise((resolve, reject) => {
            let order = this.responseMap[0].get(orderID);
            if(order)
                resolve(order);
            else
                resolve(null);
            });
    }

    saveOrders(orders: Order[]): Promise<Order[]> {
        return new Promise((resolve, reject) => {
            let order = this.responseMap[1].get(orders[0].orderID);
            if(order)
                resolve([order]);
            else
                reject(`Order ${orders[0].orderID} could not be saved`);
            });
    }

    deleteOrders(orderIDs: string[]): Promise<number> {
        return new Promise((resolve, reject) => {
            let order = this.responseMap[2].get(orderIDs[0]);
            if(order)
                resolve(1);
            else
                resolve(0);
            });
    }

    updateOrder(order: Order): Promise<Order> {
        return new Promise((resolve, reject) => {
            let updatedOrder = this.responseMap[3].get(order.orderID);
            if(updatedOrder)
                resolve(order);
            else
                reject(`Order ${order.orderID} could not be updated`);
            });
    }
    
}

export {MockPersistenceManager};