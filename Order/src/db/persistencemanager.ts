import { PizzaSpec, ItemSpec, OrderSpec } from "../model/order";
import { PizzaStoreModel } from "./PizzaStoreDBModel";

interface PersistenceManager {    
    getPizzas(name: string) : Promise<PizzaSpec[]>;
    savePizzas(pizza: PizzaSpec[]) : Promise<PizzaSpec[]>;
    deletePizzas(names: string[]) : Promise<number>;

    getItems(name: string) : Promise<ItemSpec[]>;
    saveItems(item: ItemSpec[]) : Promise<ItemSpec[]>;
    deleteItems(names: string[]) : Promise<number>;

    getOrder(orderID: string) : Promise<OrderSpec | null>;
    saveOrders(orders: OrderSpec[]) : Promise<OrderSpec[]>;
    deleteOrders(orderIDs: string[]) : Promise<number>;

}

class PersistenceManagerFactory {
    static MONGO_DB = 1;
    static REDIS = 2;
    //...and so on

    private static _mongoDBPM: PersistenceManager;

    static getPersistenceManager(type: number): PersistenceManager {
        if(type === PersistenceManagerFactory.MONGO_DB) {
            if(!PersistenceManagerFactory._mongoDBPM)
                PersistenceManagerFactory._mongoDBPM = new MongoDBPersistenceManager();
            return PersistenceManagerFactory._mongoDBPM;
        } else {
            throw new Error(`Persistence Manager not implemented for the provided type ${type}`);    
        }
    }
}

class MongoDBPersistenceManager implements PersistenceManager {

    private _storeDBModel: PizzaStoreModel;

    constructor(){
        this._storeDBModel = new PizzaStoreModel();
    }

    async getPizzas(name: string): Promise<PizzaSpec[]> {
        this.checkDB();
        let pizzas = await this._storeDBModel.getPizzaModel().find({"name": name});
        return pizzas;
    }

    async savePizzas(pizzas: PizzaSpec[]): Promise<PizzaSpec[]> {
        let savedPizzas: PizzaSpec[] = [];
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

    async getItems(pizzaName: string): Promise<ItemSpec[]> {
        this.checkDB();
        let items = await this._storeDBModel.getItemModel().find({name: pizzaName});
        return items;
    }

    async saveItems(items: ItemSpec[]): Promise<ItemSpec[]> {
        let savedItems: ItemSpec[] = [];
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

    async getOrder(orderID: string): Promise<OrderSpec | null> {
        this.checkDB();
        let order = await this._storeDBModel.getOrderModel().findOne({orderID: orderID});
        return order;
    }

    async saveOrders(orders: OrderSpec[]): Promise<OrderSpec[]> {
        let savedOrders: OrderSpec[] = [];
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