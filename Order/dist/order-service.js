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
exports.app = void 0;
const util_1 = __importDefault(require("util"));
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const PizzaStoreDBModel_1 = require("./db/PizzaStoreDBModel");
let storeDBModel;
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
function checkDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!storeDBModel) {
            //console.log(`Creating new Pizza Store DB Model`);
            storeDBModel = new PizzaStoreDBModel_1.PizzaStoreModel();
            yield storeDBModel.setup();
        }
    });
}
function savePizza(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const newPizza = new (storeDBModel.getPizzaModel())(Object.assign({}, req.body));
        return newPizza.save();
    });
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
}));
app.get('/pizza/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield checkDB();
    let pizza = yield storeDBModel.getPizzaModel().find({ "name": req.params.name });
    if (pizza.length > 0) {
        res.set('Content-Type', 'application/json').json(pizza);
    }
    else {
        console.log(`Unable to find pizza with name ${req.params.name}`);
        res.sendStatus(404);
    }
}));
app.put('/pizza', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield checkDB();
    console.log(req.headers);
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        //console.log(`Request body received as ${JSON.stringify(req.body)}`);
        try {
            if ((yield storeDBModel.getPizzaModel().find({ name: req.body.name })).length > 0) {
                //console.log(`Found some pizzas to delete first`);
                let deletedPizzas = (yield storeDBModel.getPizzaModel().deleteMany({ name: req.body.name })).deletedCount;
                //console.log(`Successfully deleted ${deletedPizzas} pizza(s). Trying to save a new pizza now...`);
            }
            let pizza = yield savePizza(req);
            //console.log(`save pizza result = ${JSON.stringify(pizza)}`);
            res.json(pizza);
        }
        catch (err) {
            console.log(`Error processing a /put pizza request...`);
            console.error(err);
            res.status(500).json({ "error": err });
        }
    }
}));
app.get('/item/:pizza', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield checkDB();
    let item = yield storeDBModel.getItemModel().findOne({ name: req.params.pizza });
    if (item /*&& item.length > 0*/) {
        res.set('Content-Type', 'application/json').json(item);
    }
    else {
        console.log(`Unable to find item with name ${req.params.pizza}`);
        res.sendStatus(404);
    }
}));
app.put('/item', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield checkDB();
    console.log(req.headers);
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        //console.log(`Request body received as ${JSON.stringify(req.body)}`);
        try {
            if ((yield storeDBModel.getItemModel().find({ name: req.body.pizza.name })).length > 0) {
                console.log(`Found some items to delete first`);
                let deletedItems = (yield storeDBModel.getItemModel().deleteMany({ name: req.body.pizza.name })).deletedCount;
                console.log(`Successfully deleted ${deletedItems} items(s). Trying to save a new item now...`);
            }
            const newItem = new (storeDBModel.getItemModel())(Object.assign({}, req.body));
            const item = yield newItem.save();
            //console.log(`save pizza result = ${JSON.stringify(item)}`);
            res.json(item);
        }
        catch (err) {
            console.log(`Error processing a /put item request...`);
            console.error(err);
            res.status(500).json({ "error": err });
        }
    }
}));
//Specific Order ID
app.route('/order/:oid')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Retrieving Order details for Order ID ${req.params.oid}`);
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Deleting Order ID ${req.params.oid}`);
}));
let listener = app.listen(() => {
    console.log();
    console.log(`Request to start Pizza store app received... [${util_1.default.inspect(listener.address(), false, null, true)}]`);
});
