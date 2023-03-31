"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockPersistenceManager = void 0;
const inversify_1 = require("inversify");
require("reflect-metadata");
let MockPersistenceManager = class MockPersistenceManager {
    constructor() {
        // Array order is 0:get, 1:save, 2:delete, 3:update 
        this.responseMap = [];
    }
    setMockResponses(responseMap) {
        this.responseMap = responseMap;
    }
    getOrder(orderID) {
        return new Promise((resolve, reject) => {
            let order = this.responseMap[0].get(orderID);
            if (order)
                resolve(order);
            else
                resolve(null);
        });
    }
    saveOrders(orders) {
        return new Promise((resolve, reject) => {
            let order = this.responseMap[1].get(orders[0].orderID);
            if (order)
                resolve([order]);
            else
                reject(`Order ${orders[0].orderID} could not be saved`);
        });
    }
    deleteOrders(orderIDs) {
        return new Promise((resolve, reject) => {
            let order = this.responseMap[2].get(orderIDs[0]);
            if (order)
                resolve(1);
            else
                resolve(0);
        });
    }
    updateOrder(order) {
        return new Promise((resolve, reject) => {
            let updatedOrder = this.responseMap[3].get(order.orderID);
            if (updatedOrder)
                resolve(order);
            else
                reject(`Order ${order.orderID} could not be updated`);
        });
    }
};
MockPersistenceManager = __decorate([
    (0, inversify_1.injectable)()
], MockPersistenceManager);
exports.MockPersistenceManager = MockPersistenceManager;
