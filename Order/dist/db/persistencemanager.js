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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersistenceManagerFactory = void 0;
const PizzaStoreMongoDBModel_1 = require("./PizzaStoreMongoDBModel");
const config_1 = __importDefault(require("config"));
class PersistenceManagerFactory {
    static getPersistenceManager() {
        if (config_1.default.get(`orderService.db.provider`) === PersistenceManagerFactory.MONGO_DB) {
            if (!PersistenceManagerFactory._mongoDBPM)
                PersistenceManagerFactory._mongoDBPM = new MongoDBPersistenceManager();
            return PersistenceManagerFactory._mongoDBPM;
        }
        else {
            throw new Error(`Persistence Manager not implemented for the provided type ${config_1.default.get(`orderService.db.provider`)}`);
        }
    }
}
exports.PersistenceManagerFactory = PersistenceManagerFactory;
PersistenceManagerFactory.MONGO_DB = "MONGO_DB";
PersistenceManagerFactory.REDIS = 2;
class MongoDBPersistenceManager {
    constructor() {
        this._storeDBModel = new PizzaStoreMongoDBModel_1.PizzaStoreMongoDBModel();
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
    getItems(pizzaName) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDB();
            let items = yield this._storeDBModel.getItemModel().find({ name: pizzaName });
            return items;
        });
    }
    saveItems(items) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedItems = [];
            this.checkDB();
            for (let item of items) {
                const newItem = new (this._storeDBModel.getItemModel())(item);
                savedItems.push(yield newItem.save());
            }
            return savedItems;
        });
    }
    deleteItems(names) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDB();
            let deletedItems = yield this._storeDBModel.getItemModel().deleteMany({ "name": { $in: names } });
            return deletedItems.deletedCount;
        });
    }
    getOrder(orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDB();
            let order = yield this._storeDBModel.getOrderModel().findOne({ orderID: orderID });
            return order;
        });
    }
    saveOrders(orders) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedOrders = [];
            this.checkDB();
            for (let order of orders) {
                const newOrder = new (this._storeDBModel.getOrderModel())(order);
                savedOrders.push(yield newOrder.save());
            }
            return savedOrders;
        });
    }
    deleteOrders(orderIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDB();
            let deletedOrders = yield this._storeDBModel.getOrderModel().deleteMany({ "orderID": { $in: orderIDs } });
            return deletedOrders.deletedCount;
        });
    }
    checkDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._storeDBModel.setup();
        });
    }
}
