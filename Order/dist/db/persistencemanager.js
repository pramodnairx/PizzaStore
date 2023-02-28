"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceManagerFactory = void 0;
const PizzaStoreDBModel_1 = require("./PizzaStoreDBModel");
class PersistenceManagerFactory {
    static getPersistenceManager(type) {
        if (type === PersistenceManagerFactory.MONGO_DB) {
            if (!PersistenceManagerFactory._mongoDBPM)
                PersistenceManagerFactory._mongoDBPM = new MongoDBPersistenceManager();
            return PersistenceManagerFactory._mongoDBPM;
        }
        else {
            throw new Error(`Persistence Manager not implemented for the provided type ${type}`);
        }
    }
}
exports.PersistenceManagerFactory = PersistenceManagerFactory;
PersistenceManagerFactory.MONGO_DB = 1;
PersistenceManagerFactory.REDIS = 2;
class MongoDBPersistenceManager {
    constructor() {
        this._storeDBModel = new PizzaStoreDBModel_1.PizzaStoreModel();
    }
    getPizzas(name) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDB();
            let pizzas = yield this._storeDBModel.getPizzaModel().find({ "name": name });
            return pizzas;
        });
    }
    savePizzas(pizzas) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedPizzas = [];
            this.checkDB();
            for (let pizza of pizzas) {
                const newPizza = new (this._storeDBModel.getPizzaModel())(pizza);
                savedPizzas.push(yield newPizza.save());
            }
            return savedPizzas;
        });
    }
    deletePizzas(pizzas) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDB();
            let deletedPizzas = yield this._storeDBModel.getPizzaModel().deleteMany({ "name": { $in: pizzas } });
            return deletedPizzas.deletedCount;
        });
    }
    checkDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._storeDBModel.setup();
        });
    }
}
