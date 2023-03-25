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
const malabi_1 = require("malabi");
const api_1 = require("@opentelemetry/api");
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
let kafka = new kafkajs_1.Kafka({
    clientId: config_1.default.get(`kitchenService.integration-test.kafka-client-id`),
    brokers: config_1.default.get(`kitchenService.messaging.kafka.brokers`)
});
let producer = kafka.producer();
let consumer = kafka.consumer({ groupId: config_1.default.get(`kitchenService.integration-test.kafka-group-id`) });
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
describe('Kitchen Service Kafka Adapter Integration Tests', () => {
    let processedOrder0;
    it('Verify an Acknowledged Order is prepared', () => __awaiter(void 0, void 0, void 0, function* () {
        reset();
        const telemetryRepo = yield (0, malabi_1.malabi)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield setupProducerAndConsumer(config_1.default.get(`kitchenService.messaging.kafka.orders-topic`), ({ topic, partition, message }) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                let msgValue = (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString();
                utils_1.logger.info(`Integration test : message received - ${msgValue}`);
                if (msgValue) {
                    let order = JSON.parse(msgValue);
                    if (order.status === order_1.OrderStatus.Ready && order.orderID === orders[0].orderID) {
                        processedOrder0 = order;
                    }
                }
            }));
            yield sendMessage(config_1.default.get(`kitchenService.messaging.kafka.orders-topic`), [
                {
                    key: orders[0].orderID,
                    value: JSON.stringify(orders[0])
                }
            ]);
            yield resultReady(() => {
                if (processedOrder0)
                    return true;
                else
                    return false;
            }, config_1.default.get(`kitchenService.integration-test.result-check-timeout`), config_1.default.get(`kitchenService.integration-test.result-check-max-tries`));
            utils_1.logger.info(`Integration test : Results ready : Order under test = ${JSON.stringify(processedOrder0)}`);
            yield tearDownProducerAndConsumer();
        }));
        const allSpans = telemetryRepo.spans.all;
        const kafkaPublishSpans = allSpans.filter((span, index) => {
            return (span.messagingSystem
                && span.messagingSystem === 'kafka')
                && span.queueOrTopicName === 'orders'
                && span.messagingDestinationKind === 'topic'
                && span.kind === api_1.SpanKind.PRODUCER;
        });
        const mongoSpans = allSpans.filter((span, index) => {
            return span.mongoCollection;
        });
        //Verify that an ACK order was produced
        expect(kafkaPublishSpans.length === 2);
        const publishedOrder0 = JSON.parse(kafkaPublishSpans[0].messagingPayload);
        expect(publishedOrder0).to.be.not.null;
        expect(publishedOrder0.orderID).to.equal(orders[0].orderID);
        expect(publishedOrder0.status).to.equal(order_1.OrderStatus.Acknowledged);
        //Verify that a duplicate order search was performed using the correct Order ID and no duplicates were found in the DB search
        expect(mongoSpans.length > 0);
        expect(mongoSpans[0].name).to.equal('mongoose.Order.findOne');
        expect(JSON.parse(mongoSpans[0].attribute('db.statement').toString()).condition.orderID).to.equal(orders[0].orderID);
        expect(mongoSpans[0].attribute('db.response')).to.equal("null");
        //Verify that a Ready order was produced
        const publishedOrder1 = JSON.parse(kafkaPublishSpans[1].messagingPayload);
        expect(publishedOrder1).to.be.not.null;
        expect(publishedOrder1.orderID).to.equal(orders[0].orderID);
        expect(publishedOrder1.status).to.equal(order_1.OrderStatus.Ready);
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
function setupProducerAndConsumer(topic, consMsgRecvdCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        yield producer.connect();
        yield consumer.connect();
        yield consumer.subscribe({ topic: topic, fromBeginning: true });
        utils_1.logger.info(`Integration test : Subscribed to Orders Topic`);
        yield consumer.run({
            eachMessage: consMsgRecvdCallback,
        });
        while (!kitchen_service_kafka_1.KitchenServiceKafkaAdapter.isInitialized()) {
            utils_1.logger.info("Waiting...");
            yield (0, promises_1.setTimeout)(config_1.default.get('kitchenService.integration-test.result-check-timeout'));
        }
    });
}
function sendMessage(topic, messages) {
    return __awaiter(this, void 0, void 0, function* () {
        yield producer.send({
            topic: topic,
            messages: messages
        });
    });
}
function tearDownProducerAndConsumer() {
    return __awaiter(this, void 0, void 0, function* () {
        yield producer.disconnect();
        yield consumer.disconnect();
        utils_1.logger.info(`Producer and Consumer disconnected`);
    });
}
