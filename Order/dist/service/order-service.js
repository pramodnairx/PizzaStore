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
const config_1 = __importDefault(require("config"));
const order_1 = require("../model/order");
const persistencemanager_1 = require("../db/persistencemanager");
const kafkajs_1 = require("kafkajs");
class OrderService {
    constructor() {
        this.ready = false;
        this.persistenceManager = persistencemanager_1.PersistenceManagerFactory.getPersistenceManager();
        this.kafka = new kafkajs_1.Kafka({
            clientId: config_1.default.get(`orderService.messaging.kafka.client-id`),
            brokers: config_1.default.get(`orderService.messaging.kafka.brokers`)
        });
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const admin = this.kafka.admin();
            yield admin.connect();
            yield admin.createTopics({
                waitForLeaders: true,
                topics: [
                    { topic: config_1.default.get(`orderService.messaging.kafka.order-topic-ack`) },
                ],
            });
            yield admin.disconnect();
        });
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
     * Deletes any existing order with the provided OrderID, persists the new order details
     * and posts the saved order to Kafka acknowledged orders topic
     *
     * @param orderID
     * @returns void
     */
    addOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (yield this.persistenceManager.getOrder(order.orderID)) {
                let deletedOrder = yield this.persistenceManager.deleteOrders([order.orderID]);
            }
            order.status = order_1.OrderStatus.Acknowledged;
            let savedOrder = yield this.persistenceManager.saveOrders([order]);
            if (savedOrder.length > 0) {
                let producer = this.kafka.producer();
                yield producer.connect();
                yield producer.send({
                    topic: config_1.default.get(`orderService.messaging.kafka.order-topic-ack`),
                    messages: [
                        {
                            key: savedOrder[0].orderID,
                            value: JSON.stringify(savedOrder[0])
                        }
                    ]
                });
                yield producer.disconnect();
            }
            else {
                throw new Error(`Error ackowledging Order no. ${order.orderID}`);
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
    isReady() {
        return this.ready;
    }
}
exports.OrderService = OrderService;
