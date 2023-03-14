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
const chai_1 = __importDefault(require("chai"));
const crypto_1 = require("crypto");
const order_1 = require("../model/order");
const kitchen_service_1 = require("../service/kitchen-service");
const inversify_config_1 = require("./inversify.config");
const persistencemanager_1 = require("../db/persistencemanager");
const mockpersistencemanager_1 = require("./mockpersistencemanager");
let expect = chai_1.default.expect;
let auth0Token /*: string*/ = "dummy";
let pizzas;
let items;
let orders;
const orderID1 = (0, crypto_1.randomBytes)(4).toString('hex');
const orderID2 = (0, crypto_1.randomBytes)(4).toString('hex');
let mockPM;
let kitchen;
let mockDBResponses = [];
const reset = function () {
    pizzas = [(new class {
            constructor() {
                this.name = "Margherita";
                this.ingredients = ["Cheese and more cheese"];
            }
        }()),
        (new class {
            constructor() {
                this.name = "Meat Feast";
                this.ingredients = ["Bacon", "Salami", "Sausage", "Anchovies"];
            }
        }()),
        //(new class implements Pizza {name = "Hawaiian"; ingredients = "Pineapple, Prawns";}())
    ];
    items = [(new class {
            constructor() {
                this.pizza = pizzas[0];
                this.price = 18.95;
            }
        }()),
        (new class {
            constructor() {
                this.pizza = pizzas[1];
                this.price = 22.10;
            }
        }())
    ];
    orders = [(new class {
            constructor() {
                this.orderID = orderID1;
                this.customerName = "Mock Hungrier Jack";
                this.status = order_1.OrderStatus.Acknowledged;
                this.customerAddress = "213 Hungryville 3026";
                this.items = [items[0], items[1]];
            }
        }()),
        (new class {
            constructor() {
                this.orderID = orderID2;
                this.customerName = "Mock Another Hungrier Jack";
                this.status = order_1.OrderStatus.Acknowledged;
                this.customerAddress = "220 Hungryville 3026";
                this.items = [items[1]];
            }
        }()),
    ];
    // Array order is 0:get, 1:save, 2:delete, 3:update 
    mockDBResponses = [
        new Map().set(orderID2, orders[1]),
        new Map().set(orderID1, orders[0]).set(orderID2, orders[1]),
        new Map().set(orderID1, orders[0]).set(orderID2, orders[1]),
        new Map().set(orderID1, orders[0]).set(orderID2, orders[1]),
    ];
};
describe('Kitchen Service Tests', () => {
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        mockPM = inversify_config_1.iocContainer.get(persistencemanager_1.TYPES.PersistenceManager);
        if (mockPM instanceof mockpersistencemanager_1.MockPersistenceManager)
            mockPM.setMockResponses(mockDBResponses);
        kitchen = new kitchen_service_1.KitchenService(mockPM);
    }));
    it('Prepare and return an Acknowledged Order', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        let order = yield kitchen.processOrder(orders[0]);
        expect(order && order !== null);
        expect(order.status).equals(order_1.OrderStatus.Ready);
        expect(order.orderID).equals(orders[0].orderID);
    }));
    it('Ignores an Order that is not in Acknowledged status', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        orders[0].status = order_1.OrderStatus.Initialized;
        let order = yield kitchen.processOrder(orders[0]);
        expect(!order);
    }));
    it('Ignore a duplicate Order', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        const order = yield kitchen.processOrder(orders[0]);
        expect(order && order !== null);
        expect(order.status).equals(order_1.OrderStatus.Ready);
        expect(order.orderID).equals(orders[0].orderID);
        reset();
        mockDBResponses[0].set(orderID1, orders[0]);
        mockPM.setMockResponses(mockDBResponses);
        const repeatOrder = yield kitchen.processOrder(orders[0]);
        expect(!repeatOrder);
    }));
});
