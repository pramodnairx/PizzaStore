import { Pizza, Item, Order } from "../model/order";
import { PizzaStoreMongoDBModel } from "./PizzaStoreMongoDBModel";
import config from 'config';

interface PersistenceManager {    
    getPizzas(name: string) : Promise<Pizza[]>;
    savePizzas(pizza: Pizza[]) : Promise<Pizza[]>;
    deletePizzas(names: string[]) : Promise<number>;

    getItems(name: string) : Promise<Item[]>;
    saveItems(item: Item[]) : Promise<Item[]>;
    deleteItems(names: string[]) : Promise<number>;

    getOrder(orderID: string) : Promise<Order | null>;
    saveOrders(orders: Order[]) : Promise<Order[]>;
    deleteOrders(orderIDs: string[]) : Promise<number>;
}

class PersistenceManagerFactory {
    static MONGO_DB = "MONGO_DB";
    static REDIS = 2;
    //...and so on

    private static _mongoDBPM: PersistenceManager;

    static getPersistenceManager(): PersistenceManager {
        if (config.get(`orderService.db.provider`) === PersistenceManagerFactory.MONGO_DB ) {
            if(!PersistenceManagerFactory._mongoDBPM)
                PersistenceManagerFactory._mongoDBPM = new MongoDBPersistenceManager();
            return PersistenceManagerFactory._mongoDBPM;
        } else {
            throw new Error(`Persistence Manager not implemented for the provided type ${config.get(`orderService.db.provider`)}`);
        }
    }
}

class MongoDBPersistenceManager implements PersistenceManager {

    private _storeDBModel: PizzaStoreMongoDBModel;

    constructor(){
        this._storeDBModel = new PizzaStoreMongoDBModel();
    }

    async getPizzas(name: string): Promise<Pizza[]> {
        this.checkDB();
        let pizzas = await this._storeDBModel.getPizzaModel().find({"name": name});
        return pizzas;
    }

    async savePizzas(pizzas: Pizza[]): Promise<Pizza[]> {
        let savedPizzas: Pizza[] = [];
        this.checkDB();
        for (let pizza of pizzas) {
            const newPizza = new (this._storeDBModel.getPizzaModel())(pizza);
            savedPizzas.push(await newPizza.save());
        }
        return savedPizzas;      
    }

    async deletePizzas(pizzas: string[]): Promise<number> {
        this.checkDB();
        let deletedPizzas = await this._storeDBModel.getPizzaModel().deleteMany({"name": {$in: pizzas}});
        return deletedPizzas.deletedCount;
    }

    async getItems(pizzaName: string): Promise<Item[]> {
        this.checkDB();
        let items = await this._storeDBModel.getItemModel().find({name: pizzaName});
        return items;
    }

    async saveItems(items: Item[]): Promise<Item[]> {
        let savedItems: Item[] = [];
        this.checkDB();
        for (let item of items) {
            const newItem = new (this._storeDBModel.getItemModel())(item);
            savedItems.push(await newItem.save());
        }
        return savedItems;      
    }

    async deleteItems(names: string[]): Promise<number> {
        this.checkDB();
        let deletedItems = await this._storeDBModel.getItemModel().deleteMany({"name": {$in: names}});
        return deletedItems.deletedCount;
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

    async deleteOrders(orderIDs: string[]): Promise<number> {
        this.checkDB();
        let deletedOrders = await this._storeDBModel.getOrderModel().deleteMany({"orderID": {$in: orderIDs}});
        return deletedOrders.deletedCount;
    }


    async checkDB(){
        await this._storeDBModel.setup();
    }   
}

export { PersistenceManagerFactory, PersistenceManager}