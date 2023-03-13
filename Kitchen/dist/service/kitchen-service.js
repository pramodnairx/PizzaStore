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
exports.KitchenService = void 0;
const config_1 = __importDefault(require("config"));
const order_1 = require("../model/order");
//import { PersistenceManagerFactory } from '../db/persistencemanager';
const utils_1 = require("../util/utils");
const kafkajs_1 = require("kafkajs");
const promises_1 = require("timers/promises");
class KitchenService {
    static init() {
        return __awaiter(this, void 0, void 0, function* () {
            let consumer = KitchenService.kafka.consumer({ groupId: `${config_1.default.get("kitchenService.messaging.kafka.group-id")}` });
            yield consumer.connect();
            yield consumer.subscribe({ topic: `${config_1.default.get(`kitchenService.messaging.kafka.order-topic-ack`)}`, fromBeginning: true });
            KitchenService.ready = true;
            yield consumer.run({
                eachMessage: ({ topic, partition, message }) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    console.log({
                        value: (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString(),
                    });
                    new KitchenService().processOrder((_b = message.value) === null || _b === void 0 ? void 0 : _b.toString());
                })
            });
        });
    }
    processOrder(orderMsg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (orderMsg) {
                this.prepareOrder(JSON.parse(orderMsg));
            }
        });
    }
    prepareOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            let msToWait = Math.random() * 10000;
            utils_1.logger.info(`Kitchen says the Order ${order.orderID} will take ${msToWait / 1000} seconds to prepare`);
            order.status = order_1.OrderStatus.Processing;
            yield (0, promises_1.setTimeout)(msToWait);
            utils_1.logger.info(`Kitchen says the Order ${order.orderID} is now ready`);
            order.status = order_1.OrderStatus.Ready;
            let producer = KitchenService.kafka.producer();
            yield producer.connect();
            yield producer.send({
                topic: config_1.default.get(`kitchenService.messaging.kafka.order-topic-ready`),
                messages: [
                    {
                        key: order.orderID,
                        value: JSON.stringify(order)
                    }
                ]
            });
            yield producer.disconnect();
        });
    }
}
exports.KitchenService = KitchenService;
KitchenService.ready = false;
KitchenService.kafka = new kafkajs_1.Kafka({
    clientId: config_1.default.get(`kitchenService.messaging.kafka.client-id`),
    brokers: config_1.default.get(`kitchenService.messaging.kafka.brokers`)
});
KitchenService.init();
