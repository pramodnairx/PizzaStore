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
exports.StoreFrontService = void 0;
const config_1 = __importDefault(require("config"));
const utils_1 = require("./util/utils");
const kafkajs_1 = require("kafkajs");
class StoreFrontInit {
    constructor() {
        this.kafka = new kafkajs_1.Kafka({
            clientId: config_1.default.get(`storefront.messaging.kafka.client-id`),
            brokers: config_1.default.get(`storefront.messaging.kafka.brokers`)
        });
    }
    static isInitialized() {
        return StoreFrontInit.initialized;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!StoreFrontInit.isInitialized()) {
                utils_1.logger.info(`Pizza Store Front Service Kafka Adapter being initialized`);
                const admin = this.kafka.admin();
                let retries = 0;
                let adminConnected = false;
                while (!adminConnected) {
                    try {
                        yield admin.connect();
                        adminConnected = true;
                    }
                    catch (err) {
                        if (err instanceof kafkajs_1.KafkaJSNonRetriableError && err.name === 'KafkaJSNumberOfRetriesExceeded') {
                            utils_1.logger.info(`Store Front Service will retry Kafka Admin connection [${10 - retries - 1}] more times`);
                            retries++;
                            if (retries === 10)
                                throw err;
                        }
                        else {
                            utils_1.logger.info(`Store Front Service exception while Admin connect - ${err}`);
                            throw err;
                        }
                    }
                }
                utils_1.logger.info(`Store Front Service Kafka Adapter - Kafka admin connected`);
                if (!((yield admin.listTopics()).includes(config_1.default.get(`storefront.messaging.kafka.orders-topic`)))) {
                    yield admin.createTopics({
                        waitForLeaders: true,
                        topics: [
                            { topic: config_1.default.get(`storefront.messaging.kafka.orders-topic`) },
                        ],
                    });
                    utils_1.logger.info(`Store Front Service Kafka Adapter created topic ${config_1.default.get(`storefront.messaging.kafka.orders-topic`)}`);
                }
                yield admin.disconnect();
                StoreFrontInit.initialized = true;
            }
            else {
                utils_1.logger.warn(`Request to re-initialize Store Front Service Kafka Adapter. Ignored. Check code flow.`);
            }
        });
    }
}
exports.StoreFrontService = StoreFrontInit;
StoreFrontInit.initialized = false;
new StoreFrontInit().init();
