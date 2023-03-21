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
exports.KitchenServiceKafkaAdapter = void 0;
const config_1 = __importDefault(require("config"));
const utils_1 = require("../../util/utils");
const kafkajs_1 = require("kafkajs");
const kitchen_service_1 = require("../kitchen-service");
const persistencemanager_1 = require("../../db/persistencemanager");
const inversify_config_1 = require("../../inversify.config");
class KitchenServiceKafkaAdapter {
    constructor() {
        this.kafka = new kafkajs_1.Kafka({
            clientId: config_1.default.get(`kitchenService.messaging.kafka.client-id`),
            brokers: config_1.default.get(`kitchenService.messaging.kafka.brokers`),
            connectionTimeout: 20000
        });
    }
    setupForCleanShutdown(consumer) {
        const errorTypes = ['unhandledRejection', 'uncaughtException'];
        const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
        errorTypes.map(type => {
            process.on(type, (e) => __awaiter(this, void 0, void 0, function* () {
                try {
                    console.log(`process.on ${type}`);
                    console.error(e);
                    yield consumer.disconnect();
                    process.exit(0);
                }
                catch (_) {
                    process.exit(1);
                }
            }));
        });
        signalTraps.map(type => {
            process.once(type, () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield consumer.disconnect();
                }
                finally {
                    process.kill(process.pid, type);
                }
            }));
        });
    }
    static isInitialized() {
        return KitchenServiceKafkaAdapter.initialized;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!KitchenServiceKafkaAdapter.isInitialized()) {
                utils_1.logger.info(`Kitchen Service Kafka Adapter being initialized`);
                const pm = inversify_config_1.iocContainer.get(persistencemanager_1.TYPES.PersistenceManager);
                this.kitchen = new kitchen_service_1.KitchenService(pm);
                utils_1.logger.info(`Kitchen Service Kafka Adapter - DB initialized`);
                let consumer = this.kafka.consumer({ groupId: `${config_1.default.get("kitchenService.messaging.kafka.group-id")}` });
                this.setupForCleanShutdown(consumer);
                yield consumer.connect();
                yield consumer.subscribe({ topic: `${config_1.default.get(`kitchenService.messaging.kafka.orders-topic`)}`, fromBeginning: true });
                utils_1.logger.info(`Kitchen Service Kafka Adapter subscribed to topic`);
                yield consumer.run({
                    eachMessage: ({ topic, partition, message }) => __awaiter(this, void 0, void 0, function* () {
                        var _a;
                        if (this.kitchen) {
                            let msgValue = (_a = message.value) === null || _a === void 0 ? void 0 : _a.toString();
                            utils_1.logger.info(`Kitchen Service Kafka Adapter processing incoming ${msgValue}`);
                            if (msgValue) {
                                let order = yield this.kitchen.processOrder(JSON.parse(msgValue));
                                if (order && order !== null) {
                                    this.orderReady(order);
                                }
                            }
                            else {
                                utils_1.logger.warn(`Empty message received. Ignoring. ${topic} - ${partition} - ${message}`);
                            }
                        }
                        else {
                            utils_1.logger.warn(`Kithen Service Kafka Adapter - Kitchen service not ready, message being ignored : ${message}`);
                        }
                    })
                });
                KitchenServiceKafkaAdapter.initialized = true;
            }
            else {
                utils_1.logger.warn(`Request to re-initialize Kitchen Service Kafka Adapter. Ignored. Check code flow.`);
            }
        });
    }
    orderReady(order) {
        return __awaiter(this, void 0, void 0, function* () {
            utils_1.logger.info(`Kitchen Service Kafka Adapter sending Order ready message ${JSON.stringify(order)}`);
            let producer = this.kafka.producer();
            yield producer.connect();
            yield producer.send({
                topic: config_1.default.get(`kitchenService.messaging.kafka.orders-topic`),
                messages: [
                    {
                        key: order.orderID,
                        value: JSON.stringify(order)
                    }
                ]
            });
            yield producer.disconnect();
            utils_1.logger.info(`Kitchen Service Kafka Adapter Order ready message sent.`);
        });
    }
}
exports.KitchenServiceKafkaAdapter = KitchenServiceKafkaAdapter;
KitchenServiceKafkaAdapter.initialized = false;
new KitchenServiceKafkaAdapter().init();
