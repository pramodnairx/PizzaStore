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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importStar(require("mongoose"));
console.log(`Index.ts -> we are being loaded!`);
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT;
const pizzaSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    ingredients: { type: String, required: true }
});
const itemSchema = new mongoose_1.Schema({
    pizza: [pizzaSchema],
    price: Number
});
const orderSchema = new mongoose_1.Schema({
    orderID: String,
    customerName: String,
    customerAddress: String,
    items: [itemSchema]
});
const PizzaModel = mongoose_1.default.model('Pizza', pizzaSchema);
const ItemModel = mongoose_1.default.model('Item', itemSchema);
const OrderModel = mongoose_1.default.model('Order', orderSchema);
try {
    mongoose_1.default.connect('mongodb+srv://skywalker:EenieMynie8080@bazinga.zwxlq0g.mongodb.net/?retryWrites=true&w=majority');
    console.log("Connected to Mongo DB");
    /*
    app.listen(port, () => {
        console.log(`Pizza Store server running at http://localhost:${port}`);
    });
    */
}
catch (error) {
    console.error(error);
    process.exit(1);
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
}));
app.post('/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newOrder = new OrderModel(Object.assign({}, JSON.parse(req.body)));
    newOrder.save((err) => {
        console.error(err);
    });
    res.send(`Order received`);
}));
app.post('/pizza', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Received pizza post as unparsed : ${req.body}`);
    const newPizza = new PizzaModel(Object.assign({}, JSON.parse(req.body)));
    newPizza.save((err) => {
        console.error(err);
    });
    res.send(`Pizza received`);
}));
//Specific Order ID
app.route('/order/:oid')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Retrieving Order details for Order ID ${req.params.oid}`);
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Deleting Order ID ${req.params.oid}`);
}));
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        /*
        app.listen(port, () => {
            console.log(`Pizza Store server running at http://localhost:${port}`);
        });
        */
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
    finally {
        /*
        if(mongoose.connection) {
            await mongoose.connection.destroy();
        }
        console.log('Mongoose DB connection destroyed');
        */
    }
});
