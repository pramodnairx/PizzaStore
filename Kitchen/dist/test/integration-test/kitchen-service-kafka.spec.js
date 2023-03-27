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
const kafkajs_1 = require("kafkajs");
const promises_1 = require("timers/promises");
const crypto_1 = require("crypto");
const chai_1 = __importDefault(require("chai"));
const order_1 = require("../../model/order");
const config_1 = __importDefault(require("config"));
const utils_1 = require("../../util/utils");
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
                this.orderID = (0, crypto_1.randomBytes)(8).toString('hex');
                this.customerName = "Real Wrong Jack";
                this.status = order_1.OrderStatus.Ready;
                this.customerAddress = "213 Hungryville 3026";
                this.items = [items[0], items[1]];
            }
        }())
    ];
};
describe('Kitchen Service Kafka Adapter Integration Tests', () => {
    it('Verify an Acknowledged Order is prepared', () => __awaiter(void 0, void 0, void 0, function* () {
        let processedOrder;
        reset();
        const telemetryRepo = yield (0, malabi_1.malabi)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield setupProducerAndConsumer(config_1.default.get(`kitchenService.messaging.kafka.orders-topic`), ({ topic, partition, message }) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                let msgValue = (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString();
                utils_1.logger.debug(`Integration test : message received - ${msgValue}`);
                if (msgValue) {
                    let order = JSON.parse(msgValue);
                    if (order.status === order_1.OrderStatus.Ready && order.orderID === orders[0].orderID) {
                        processedOrder = order;
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
                if (processedOrder)
                    return true;
                else
                    return false;
            }, config_1.default.get(`kitchenService.integration-test.result-check-timeout`), config_1.default.get(`kitchenService.integration-test.result-check-max-tries`));
            utils_1.logger.debug(`Integration test : Results ready : Order under test = ${JSON.stringify(processedOrder)}`);
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
        //Verify 2 and only 2 messages were produced to the kafka orders topic - one for order ACK and one for order READY
        expect(kafkaPublishSpans.length === 2);
        //Verify that an ACK order was produced
        const publishedOrder0 = JSON.parse(kafkaPublishSpans[0].messagingPayload);
        expect(publishedOrder0).to.be.not.null;
        expect(publishedOrder0.orderID).to.equal(orders[0].orderID);
        expect(publishedOrder0.status).to.equal(order_1.OrderStatus.Acknowledged);
        //Verify that a duplicate order search was performed using the correct Order ID and no duplicates were found in the DB search
        expect(mongoSpans.length > 1);
        expect(mongoSpans[0].name).to.equal('mongoose.Order.findOne');
        expect(mongoSpans[0].attribute('db.statement')).to.be.not.null;
        expect(JSON.parse(mongoSpans[0].attribute('db.statement').toString()).condition.orderID).to.equal(orders[0].orderID);
        expect(mongoSpans[0].attribute('db.response')).to.equal("null");
        //Verify that a Ready order was produced
        const publishedOrder1 = JSON.parse(kafkaPublishSpans[1].messagingPayload);
        expect(publishedOrder1).to.be.not.null;
        expect(publishedOrder1.orderID).to.equal(orders[0].orderID);
        expect(publishedOrder1.status).to.equal(order_1.OrderStatus.Ready);
    }));
    it('Verify a duplicate Order is ignored by the Kitchen service', () => __awaiter(void 0, void 0, void 0, function* () {
        let processedOrder;
        let orderID;
        reset();
        const telemetryRepo = yield (0, malabi_1.malabi)(() => __awaiter(void 0, void 0, void 0, function* () {
            yield setupProducerAndConsumer(config_1.default.get(`kitchenService.messaging.kafka.orders-topic`), ({ topic, partition, message }) => __awaiter(void 0, void 0, void 0, function* () {
                var _b;
                let msgValue = (_b = message.value) === null || _b === void 0 ? void 0 : _b.toString();
                utils_1.logger.debug(`Integration test : message received - ${msgValue}`);
                if (msgValue) {
                    let order = JSON.parse(msgValue);
                    if (order.status === order_1.OrderStatus.Ready && order.orderID === orders[0].orderID) {
                        processedOrder = order;
                        orderID = order.orderID;
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
                if (processedOrder)
                    return true;
                else
                    return false;
            }, config_1.default.get(`kitchenService.integration-test.result-check-timeout`), config_1.default.get(`kitchenService.integration-test.result-check-max-tries`));
            utils_1.logger.debug(`Integration test : Results ready : Order under test = ${JSON.stringify(processedOrder)}`);
            //Duplicate order
            yield sendMessage(config_1.default.get(`kitchenService.messaging.kafka.orders-topic`), [
                {
                    key: orders[0].orderID,
                    value: JSON.stringify(orders[0])
                }
            ]);
            yield (0, promises_1.setTimeout)(10000); //Giving some time for kafka and kitchen service to process
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
        //Verify 1 and only 1 message was produced to the kafka orders topic - for order ACK. No READY should have been produced
        expect(kafkaPublishSpans.length === 1);
        //Verify that an ACK order was produced
        const publishedOrder0 = JSON.parse(kafkaPublishSpans[0].messagingPayload);
        expect(publishedOrder0).to.be.not.null;
        expect(publishedOrder0.orderID).to.equal(orders[0].orderID);
        expect(publishedOrder0.status).to.equal(order_1.OrderStatus.Acknowledged);
        //Verify that a duplicate order search was performed using the correct Order ID and duplicates were found in the DB search
        expect(mongoSpans.length > 2);
        expect(mongoSpans[2].name).to.equal('mongoose.Order.findOne');
        expect(mongoSpans[2].attribute('db.statement')).to.be.not.null;
        expect(JSON.parse(mongoSpans[2].attribute('db.statement').toString()).condition.orderID).to.equal(orders[0].orderID);
        expect(mongoSpans[2].attribute('db.response')).to.not.equal("null");
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
        utils_1.logger.debug(`Integration test : Subscribed to Orders Topic`);
        yield consumer.run({
            eachMessage: consMsgRecvdCallback,
        });
        while (!kitchen_service_kafka_1.KitchenServiceKafkaAdapter.isInitialized()) {
            utils_1.logger.info("Waiting for Kitchen Service Kafka Adapter to initalize...");
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
