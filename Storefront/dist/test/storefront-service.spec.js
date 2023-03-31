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
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const crypto_1 = require("crypto");
const order_1 = require("../model/order");
const storefront_service_1 = require("../service/storefront-service");
const inversify_config_1 = require("./inversify.config");
const persistencemanager_1 = require("../db/persistencemanager");
const mockpersistencemanager_1 = require("./mockpersistencemanager");
chai_1.default.use(chai_as_promised_1.default);
let expect = chai_1.default.expect;
//var chaiAsPromised = require("chai-as-promised");
let auth0Token /*: string*/ = "dummy";
let pizzas;
let items;
let orders;
const orderID0 = (0, crypto_1.randomBytes)(4).toString('hex');
const orderID1 = (0, crypto_1.randomBytes)(4).toString('hex');
let mockPM;
let storeFront;
let mockDBResponses = [];
const reset = function () {
    pizzas = [(new class {
            constructor() {
                this.name = "Cheesios";
                this.ingredients = ["Cheese and more cheese"];
            }
        }()),
        (new class {
            constructor() {
                this.name = "Carnivora";
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
                this.orderID = orderID0;
                this.customerName = "Mock McD";
                this.status = order_1.OrderStatus.Initialized;
                this.customerAddress = "213 Hungryville 3026";
                this.items = [items[0], items[1]];
            }
        }()),
        (new class {
            constructor() {
                this.orderID = orderID0;
                this.customerName = "Mock McD";
                this.status = order_1.OrderStatus.Acknowledged;
                this.customerAddress = "213 Hungryville 3026";
                this.items = [items[0], items[1]];
            }
        }()),
        (new class {
            constructor() {
                this.orderID = orderID1;
                this.customerName = "Mock Burger King";
                this.status = order_1.OrderStatus.Ready;
                this.customerAddress = "220 Hungryville 3026";
                this.items = [items[1]];
            }
        }()),
    ];
    // Array order is 0:get, 1:save, 2:delete, 3:update 
    mockDBResponses = [];
};
describe('Store Front Service Tests', () => {
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        mockPM = inversify_config_1.iocContainer.get(persistencemanager_1.TYPES.PersistenceManager);
        if (mockPM instanceof mockpersistencemanager_1.MockPersistenceManager)
            mockPM.setMockResponses(mockDBResponses);
        storeFront = new storefront_service_1.StoreFrontService(mockPM);
    }));
    it('Initiate a valid order and verify it is in acknowledged state', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        if (mockPM instanceof mockpersistencemanager_1.MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set(orderID0, undefined),
                new Map().set(orderID0, orders[1]),
            ]);
        }
        let order = yield storeFront.initiateOrder(orders[0]);
        expect(order && order !== null);
        expect(order.status).equals(order_1.OrderStatus.Acknowledged);
        expect(order.orderID).equals(orders[0].orderID);
    }));
    it('Initiate an invalid order (status = Ready) and verify it is discarded', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        if (mockPM instanceof mockpersistencemanager_1.MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set(orderID1, undefined),
            ]);
        }
        let order = yield storeFront.initiateOrder(orders[2]);
        expect(!order);
    }));
    it('Initiate a duplicate order and verify it is discarded', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        if (mockPM instanceof mockpersistencemanager_1.MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set(orderID0, orders[1]),
            ]);
        }
        let order = yield storeFront.initiateOrder(orders[0]);
        expect(!order);
    }));
    it('Check status of a valid acknowldged order as Acknowledged', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        if (mockPM instanceof mockpersistencemanager_1.MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set(orderID0, orders[1]),
            ]);
        }
        let orderStatus = yield storeFront.getOrderStatus(orders[0].orderID);
        expect(orderStatus);
        expect(orderStatus).equals(order_1.OrderStatus.Acknowledged);
    }));
    it('Check status of an invalid order ID and verify an exception is thrown', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        if (mockPM instanceof mockpersistencemanager_1.MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set("dummy", orders[1]),
            ]);
        }
        expect(storeFront.getOrderStatus("")).to.be.rejectedWith(Error);
    }));
    it('Check status of a non-existent order ID and verify an undefined value is received', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        if (mockPM instanceof mockpersistencemanager_1.MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set("dummy", orders[1]),
            ]);
        }
        expect(!storeFront.getOrderStatus("does-not-exist"));
    }));
});
