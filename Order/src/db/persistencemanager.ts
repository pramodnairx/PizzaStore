import { PizzaSpec } from "../model/order";
import { PizzaStoreModel } from "./PizzaStoreDBModel";

interface PersistenceManager {    
    getPizzas(name: string) : Promise<PizzaSpec[]>;
    savePizzas(pizza: PizzaSpec[]) : Promise<PizzaSpec[]>;
    deletePizzas(names: string[]) : Promise<number>;
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

    async checkDB(){
        await this._storeDBModel.setup();
    }   
}

export { PersistenceManagerFactory, PersistenceManager}