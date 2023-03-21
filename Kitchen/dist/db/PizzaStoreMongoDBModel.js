"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KitchenMongoDBModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const config_1 = __importDefault(require("config"));
const utils_1 = require("../util/utils");
class KitchenMongoDBModel {
    constructor() {
        this.connected = false;
        this.pizzaSchema = new mongoose_1.Schema({
            name: { type: String, required: true },
            ingredients: { type: [String], required: true }
        });
        this.itemSchema = new mongoose_1.Schema({
            pizza: this.pizzaSchema,
            price: Number
        });
        this.orderSchema = new mongoose_1.Schema({
            orderID: String,
            customerName: String,
            customerAddress: String,
            items: [this.itemSchema]
        });
        this.PizzaModel = mongoose_1.default.model('Pizza', this.pizzaSchema);
        this.ItemModel = mongoose_1.default.model('Item', this.itemSchema);
        this.OrderModel = mongoose_1.default.model('Order', this.orderSchema);
    }
    setup() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected) {
                try {
                    utils_1.logger.info(`Initiating Mongo DB connectivity...`);
                    yield mongoose_1.default.connect(config_1.default.get(`kitchenService.db.connectionString`));
                    utils_1.logger.info(`Connected to Mongo DB. Connection ID = ${mongoose_1.default.connection.id}`);
                    this.connected = true;
                    mongoose_1.default.connection.on(`disconnected`, () => {
                        utils_1.logger.info(`Mongo DB disconnect event triggered.`);
                    });
                }
                catch (error) {
                    console.error(error);
                    throw error;
                }
            }
        });
    }
    getPizzaModel() {
        return this.PizzaModel;
    }
    getItemModel() {
        return this.ItemModel;
    }
    getOrderModel() {
        return this.OrderModel;
    }
    isConnected() {
        return this.connected;
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.connected && mongoose_1.default.connection) {
                utils_1.logger.info(`Disconnecting Mongo DB connection`);
                yield mongoose_1.default.connection.close();
                utils_1.logger.info(`Mongo DB disconnected`);
            }
            else {
                utils_1.logger.info(`No active Mongo DB connection to disconnect`);
            }
        });
    }
}
exports.KitchenMongoDBModel = KitchenMongoDBModel;
