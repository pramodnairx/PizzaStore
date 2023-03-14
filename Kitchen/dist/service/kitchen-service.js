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
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenService = void 0;
require("reflect-metadata");
const order_1 = require("../model/order");
const utils_1 = require("../util/utils");
const promises_1 = require("timers/promises");
class KitchenService {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
    }
    processOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            if (order.status === order_1.OrderStatus.Acknowledged) {
                utils_1.logger.info(`Kitchen says Ack order receieved = ${JSON.stringify(order)}`);
                //Check for duplicates processed by other Kitchen Service instances
                if (yield this.persistenceManager.getOrder(order.orderID)) {
                    utils_1.logger.warn(`Kitchen say Order ID ${order.orderID} is already being processed. Received a duplicate order. Ignoring.`);
                }
                else {
                    yield this.persistenceManager.saveOrders([order]);
                    let msToWait = Math.random() * 10000;
                    utils_1.logger.info(`Kitchen says the Order ${order.orderID} will take ${msToWait / 1000} seconds to prepare`);
                    order.status = order_1.OrderStatus.Processing;
                    yield (0, promises_1.setTimeout)(msToWait);
                    utils_1.logger.info(`Kitchen says the Order ${order.orderID} is now ready`);
                    order.status = order_1.OrderStatus.Ready;
                    yield this.persistenceManager.updateOrder(order);
                }
            }
            else {
                utils_1.logger.info(`Kitchen ignoring an Order with status ${order.status}`);
            }
            return order;
        });
    }
}
exports.KitchenService = KitchenService;
