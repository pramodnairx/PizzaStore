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
const order_1 = require("../../model/order");
const config_1 = __importDefault(require("config"));
const kafkajs_1 = require("kafkajs");
const utils_1 = require("../../util/utils");
const promises_1 = require("timers/promises");
const crypto_1 = require("crypto");
const kitchen_service_kafka_1 = require("../../service/adapters/kitchen-service-kafka");
let expect = chai_1.default.expect;
let pizzas;
let items;
let orders;
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
                this.orderID = (0, crypto_1.randomBytes)(5).toString('hex');
                this.customerName = "Real Hungrier Jack";
                this.status = order_1.OrderStatus.Acknowledged;
                this.customerAddress = "213 Hungryville 3026";
                this.items = [items[0], items[1]];
            }
        }()),
        (new class {
            constructor() {
                this.orderID = (0, crypto_1.randomBytes)(3).toString('hex');
                this.customerName = "Real Wrong Jack";
                this.status = order_1.OrderStatus.Ready;
                this.customerAddress = "213 Hungryville 3026";
                this.items = [items[0], items[1]];
            }
        }())
    ];
};
let kafka = new kafkajs_1.Kafka({
    clientId: config_1.default.get(`kitchenService.integration-test.kafka-client-id`),
    brokers: config_1.default.get(`kitchenService.messaging.kafka.brokers`)
});
let producer = kafka.producer();
let consumer = kafka.consumer({ groupId: config_1.default.get(`kitchenService.integration-test.kafka-group-id`) });
describe('Kitchen Service Kafka Adapter Integration Tests', () => {
    let processedOrder0;
    before(() => __awaiter(void 0, void 0, void 0, function* () {
        yield producer.connect();
        yield consumer.connect();
        yield consumer.subscribe({ topic: `${config_1.default.get(`kitchenService.messaging.kafka.orders-topic`)}`, fromBeginning: true });
        utils_1.logger.info(`Integration test : Subscribed to Orders Topic`);
        yield consumer.run({
            eachMessage: ({ topic, partition, message }) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                let msgValue = (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString();
                utils_1.logger.info(`Integration test : message received - ${msgValue}`);
                if (msgValue) {
                    let order = JSON.parse(msgValue);
                    if (order.status === order_1.OrderStatus.Ready && order.orderID === orders[0].orderID) {
                        processedOrder0 = order;
                    }
                }
                else {
                    //Ignore maybe?
                }
            }),
        });
        while (!kitchen_service_kafka_1.KitchenServiceKafkaAdapter.isInitialized()) {
            utils_1.logger.info("Waiting...");
            yield (0, promises_1.setTimeout)(config_1.default.get('kitchenService.integration-test.result-check-timeout'));
        }
    }));
    it('Verify an Acknowledged Order is prepared', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        yield producer.send({
            topic: config_1.default.get(`kitchenService.messaging.kafka.orders-topic`),
            messages: [
                {
                    key: orders[0].orderID,
                    value: JSON.stringify(orders[0])
                }
            ]
        });
        utils_1.logger.info(`Integration test : ACK Order sent.`);
        yield resultReady(() => {
            if (processedOrder0)
                return true;
            else
                return false;
        }, config_1.default.get(`kitchenService.integration-test.result-check-timeout`), config_1.default.get(`kitchenService.integration-test.result-check-max-tries`));
        expect(processedOrder0).to.be.not.null;
        expect(processedOrder0.orderID).to.equal(orders[0].orderID);
        expect(processedOrder0.status).to.equal(order_1.OrderStatus.Ready);
    }));
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield producer.disconnect();
        yield consumer.disconnect();
        utils_1.logger.info(`Producer and Consumer disconnected`);
    }));
    function resultReady(predicate, timeout, maxTries) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                while (!predicate()) {
                    yield (0, promises_1.setTimeout)(timeout);
                }
                resolve(true);
            }));
        });
    }
});
