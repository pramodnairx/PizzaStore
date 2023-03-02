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
exports.OrderService = void 0;
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("config"));
const persistencemanager_1 = require("../db/persistencemanager");
const logger = winston_1.default.createLogger({
    level: `${config_1.default.get('orderService.logging.default')}`,
    format: winston_1.default.format.json(),
    //defaultMeta: { service: 'user-service' },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.simple(),
        })
    ]
});
class OrderService {
    constructor() {
        this.persistenceManager = persistencemanager_1.PersistenceManagerFactory.getPersistenceManager();
    }
    /**
     *
     * @param pizzaName
     * @returns array of pizza's matching the name. If no match an empty array is returned
     */
    getPizza(pizzaName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persistenceManager.getPizzas(pizzaName);
        });
    }
    /**
     * Deletes any existing pizzas with the same name and adds a new pizza
     *
     * @param pizza
     * @returns the saved pizza as received from the backend
     */
    addPizza(pizza) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield this.persistenceManager.getPizzas(pizza.name)).length > 0) {
                let deletedPizzas = yield this.persistenceManager.deletePizzas([pizza.name]);
            }
            let savedPizzas = yield this.persistenceManager.savePizzas([pizza]);
            if (savedPizzas.length > 0) {
                return savedPizzas[0];
            }
            else {
                throw new Error(`Error adding a ${pizza.name} pizza.`);
            }
        });
    }
    /**
     * Deletes all pizza's with the name as
     *
     * @param pizza
     * @returns
     */
    deletePizza(pizza) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persistenceManager.deletePizzas([pizza]);
        });
    }
    /**
     *
     * @param pizzaName
     * @returns array of items's matching the name. If no match an empty array is returned
     */
    getItem(pizzaName) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persistenceManager.getItems(pizzaName);
        });
    }
    /**
     * Deletes any existing items with the same pizza name and adds a new item
     *
     * @param item
     * @returns the saved item as received from the backend
     */
    addItem(item) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((yield this.persistenceManager.getItems(item.pizza.name)).length > 0) {
                let deletedItems = yield this.persistenceManager.deleteItems([item.pizza.name]);
            }
            let savedItems = yield this.persistenceManager.saveItems([item]);
            if (savedItems.length > 0) {
                return savedItems[0];
            }
            else {
                throw new Error(`Error adding a ${item.pizza.name} item.`);
            }
        });
    }
    /**
     * Deletes all items's with the pizza name provided
     *
     * @param pizza
     * @returns
     */
    deleteItem(pizza) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persistenceManager.deleteItems([pizza]);
        });
    }
    /**
     *
     * @param orderID
     * @returns Order matching the name. If no match null is returned
     */
    getOrder(orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persistenceManager.getOrder(orderID);
        });
    }
    /**
     * Deletes any existing order with the provided OrderID and adds a new one
     *
     * @param orderID
     * @returns the saved Order as received from the backend
     */
    addOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.persistenceManager.getOrder(order.orderID)) {
                let deletedOrder = yield this.persistenceManager.deleteOrders([order.orderID]);
            }
            let savedOrder = yield this.persistenceManager.saveOrders([order]);
            if (savedOrder.length > 0) {
                return savedOrder[0];
            }
            else {
                throw new Error(`Error adding Order no. ${order.orderID}`);
            }
        });
    }
    /**
     * Deletes all Orders with the provided orderID
     *
     * @param orderID
     * @returns
     */
    deleteOrder(orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.persistenceManager.deleteOrders([orderID]);
        });
    }
}
exports.OrderService = OrderService;
