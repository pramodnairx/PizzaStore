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
exports.StoreFrontService = void 0;
const order_1 = require("../model/order");
const utils_1 = require("./../util/utils");
class StoreFrontService {
    constructor(persistenceManager) {
        this.persistenceManager = persistenceManager;
    }
    /**
     * Receives an Order with a unique orderID for processing.
     *
     * @param order Order with Initialized status and a unique orderID
     * @returns An order with Acknowledged status OR an undefined object if duplicate / invalid order received
     */
    initiateOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            let processedOrder;
            if (order.status && order.status === order_1.OrderStatus.Initialized) {
                //check duplicate orders already being processed (maybe another node)
                if (yield this.persistenceManager.getOrder(order.orderID)) {
                    utils_1.logger.warn(`Store front say Order ID ${order.orderID} is already being processed. Received a duplicate order. Ignoring.`);
                }
                else {
                    //Change the order status and save it
                    order.status = order_1.OrderStatus.Acknowledged;
                    yield this.persistenceManager.saveOrders([order]);
                    processedOrder = order;
                    utils_1.logger.debug(`Store front service has initiated processing of Order ${processedOrder.orderID}`);
                }
            }
            else {
                utils_1.logger.warn(`Store front service received an order with status ${order.status}. Ignoring.`);
            }
            return processedOrder;
        });
    }
    getOrderStatus(orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            let foundOrderStatus;
            if (orderID) {
                let order = yield this.persistenceManager.getOrder(orderID);
                if (order) {
                    foundOrderStatus = order.status;
                }
            }
            else {
                throw new Error(`Invalid / Null orderID received for querying status`);
            }
            return foundOrderStatus;
        });
    }
    processDeliveredOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`processDeliveredOrder feature not implemented yet`);
        });
    }
    processStockUpdate() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error(`processStockUpdate feature not implemented yet`);
        });
    }
}
exports.StoreFrontService = StoreFrontService;
