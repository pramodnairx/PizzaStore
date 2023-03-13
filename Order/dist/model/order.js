"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["Initialized"] = "INIT";
    OrderStatus["Acknowledged"] = "ACK";
    OrderStatus["Processing"] = "PROC";
    OrderStatus["Ready"] = "READY";
})(OrderStatus || (OrderStatus = {}));
exports.OrderStatus = OrderStatus;
