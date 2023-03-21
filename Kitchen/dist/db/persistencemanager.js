"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.TYPES = exports.MongoDBPersistenceManager = void 0;
const inversify_1 = require("inversify");
require("reflect-metadata");
const PizzaStoreMongoDBModel_1 = require("./PizzaStoreMongoDBModel");
const TYPES = {
    PersistenceManager: Symbol.for("PersistenceManager")
};
exports.TYPES = TYPES;
let MongoDBPersistenceManager = class MongoDBPersistenceManager {
    constructor() {
        this._storeDBModel = new PizzaStoreMongoDBModel_1.KitchenMongoDBModel();
    }
    getOrder(orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDB();
            let order = yield this._storeDBModel.getOrderModel().findOne({ orderID: orderID });
            return order;
        });
    }
    saveOrders(orders) {
        return __awaiter(this, void 0, void 0, function* () {
            let savedOrders = [];
            this.checkDB();
            for (let order of orders) {
                const newOrder = new (this._storeDBModel.getOrderModel())(order);
                savedOrders.push(yield newOrder.save());
            }
            return savedOrders;
        });
    }
    updateOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            let updatedOrder;
            this.checkDB();
            this._storeDBModel.getOrderModel().updateOne({ orderID: order.orderID }, { order });
            return order;
        });
    }
    deleteOrders(orderIDs) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkDB();
            let deletedOrders = yield this._storeDBModel.getOrderModel().deleteMany({ "orderID": { $in: orderIDs } });
            return deletedOrders.deletedCount;
        });
    }
    checkDB() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._storeDBModel.setup();
        });
    }
};
MongoDBPersistenceManager = __decorate([
    (0, inversify_1.injectable)(),
    __metadata("design:paramtypes", [])
], MongoDBPersistenceManager);
exports.MongoDBPersistenceManager = MongoDBPersistenceManager;
