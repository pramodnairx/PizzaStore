import { injectable, inject } from "inversify";
import 'reflect-metadata';
import { Order } from "../model/order";
import { KitchenMongoDBModel } from "./PizzaStoreMongoDBModel"; 
import config from 'config';

interface PersistenceManager {    
    getOrder(orderID: string) : Promise<Order | null>;
    saveOrders(orders: Order[]) : Promise<Order[]>;
    deleteOrders(orderIDs: string[]) : Promise<number>;
    updateOrder(order: Order) : Promise<Order>;
}

const TYPES = {
    PersistenceManager: Symbol.for("PersistenceManager")
};

@injectable()
class MongoDBPersistenceManager implements PersistenceManager {

    private _storeDBModel: KitchenMongoDBModel;

    constructor(){
        this._storeDBModel = new KitchenMongoDBModel();
    }

    async getOrder(orderID: string): Promise<Order | null> {
        this.checkDB();
        let order = await this._storeDBModel.getOrderModel().findOne({orderID: orderID});
        return order;
    }

    async saveOrders(orders: Order[]): Promise<Order[]> {
        let savedOrders: Order[] = [];
        this.checkDB();
        for (let order of orders) {
            const newOrder = new (this._storeDBModel.getOrderModel())(order);
            savedOrders.push(await newOrder.save());
        }
        return savedOrders;      
    }

    async updateOrder(order: Order) : Promise<Order> {
        let updatedOrder: Order;
        this.checkDB();
        this._storeDBModel.getOrderModel().updateOne({orderID: order.orderID}, {order});
        return order;      
    }

    async deleteOrders(orderIDs: string[]): Promise<number> {
        this.checkDB();
        let deletedOrders = await this._storeDBModel.getOrderModel().deleteMany({"orderID": {$in: orderIDs}});
        return deletedOrders.deletedCount;
    }

    async checkDB(){
        await this._storeDBModel.setup();
    }   
}

export { PersistenceManager, MongoDBPersistenceManager, TYPES}