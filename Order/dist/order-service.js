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
const express_oauth2_jwt_bearer_1 = require("express-oauth2-jwt-bearer");
const dotenv_1 = __importDefault(require("dotenv"));
const persistencemanager_1 = require("./db/persistencemanager");
let storeDBModel;
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const jwtCheck = (0, express_oauth2_jwt_bearer_1.auth)({
    audience: 'https://pizzaorderservice.pramodnairx',
    issuerBaseURL: 'https://dev-wmzvd34fb17s8ovr.us.auth0.com/',
    tokenSigningAlg: 'RS256'
});
//app.use(jwtCheck);
function savePizza(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const newPizza = new (storeDBModel.getPizzaModel())(Object.assign({}, req.body));
        return newPizza.save();
    });
}
app.get('/auth', (req, res) => {
    res.send(`Secured Resource`);
});
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
}));
app.route('/pizza/:name')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pizza = yield persistencemanager_1.PersistenceManagerFactory.getPersistenceManager(persistencemanager_1.PersistenceManagerFactory.MONGO_DB).getPizzas(req.params.name);
    if (pizza.length > 0) {
        res.set('Content-Type', 'application/json').json(pizza);
    }
    else {
        console.log(`Unable to find pizza with name ${req.params.name}`);
        res.sendStatus(404);
    }
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let deletedPizzas = yield persistencemanager_1.PersistenceManagerFactory.getPersistenceManager(persistencemanager_1.PersistenceManagerFactory.MONGO_DB).deletePizzas([req.params.name]);
    if (deletedPizzas > 0) {
        res.set('Content-Type', 'application/json').json(deletedPizzas);
    }
    else {
        console.log(`Unable to find pizza with name ${req.params.name}`);
        res.sendStatus(404);
    }
}));
app.put('/pizza', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        try {
            if ((yield persistencemanager_1.PersistenceManagerFactory.getPersistenceManager(persistencemanager_1.PersistenceManagerFactory.MONGO_DB).getPizzas(req.body.name)).length > 0) {
                let deletedPizzas = yield persistencemanager_1.PersistenceManagerFactory.getPersistenceManager(persistencemanager_1.PersistenceManagerFactory.MONGO_DB).deletePizzas([req.params.name]);
            }
            let pizza = yield persistencemanager_1.PersistenceManagerFactory.getPersistenceManager(persistencemanager_1.PersistenceManagerFactory.MONGO_DB).savePizzas([Object.assign({}, req.body)]);
            res.json(pizza);
        }
        catch (err) {
            console.log(`Error processing a /put pizza request...`);
            console.error(err);
            res.status(500).json({ "error": err });
        }
    }
}));
app.route('/item/:pizza')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //await checkDB();
    let item = yield storeDBModel.getItemModel().findOne({ name: req.params.pizza });
    if (item /*&& item.length > 0*/) {
        res.set('Content-Type', 'application/json').json(item);
    }
    else {
        console.log(`Unable to find item with name ${req.params.pizza}`);
        res.sendStatus(404);
    }
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //await checkDB();
    let item = yield storeDBModel.getItemModel().findOneAndDelete({ name: req.params.pizza });
    if (item /*&& item.length > 0*/) {
        res.set('Content-Type', 'application/json').json(item);
    }
    else {
        console.log(`Unable to find item with name ${req.params.pizza}`);
        res.sendStatus(404);
    }
}));
app.put('/item', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //await checkDB();
    //console.log(req.headers);
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
app.route('/order/:orderID')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //await checkDB();
    let order = yield storeDBModel.getOrderModel().find({ orderID: req.params.orderID });
    if (order.length > 0) {
        res.set('Content-Type', 'application/json').json(order);
    }
    else {
        console.log(`Unable to find Order with ID ${req.params.orderID}`);
        res.sendStatus(404);
    }
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //await checkDB();
    let order = yield storeDBModel.getOrderModel().findOneAndDelete({ orderID: req.params.orderID });
    if (order) {
        res.set('Content-Type', 'application/json').json(order);
    }
    else {
        console.log(`Unable to find Order with ID ${req.params.orderID}`);
        res.sendStatus(404);
    }
}));
app.put('/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //await checkDB();
    //console.log(req.headers);
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        //console.log(`Request body received as ${JSON.stringify(req.body)}`);
        try {
            if ((yield storeDBModel.getOrderModel().find({ orderID: req.body.orderID })).length > 0) {
                console.log(`Found some orders to delete first`);
                let deletedItems = (yield storeDBModel.getOrderModel().deleteMany({ orderID: req.body.orderID })).deletedCount;
                console.log(`Successfully deleted ${deletedItems} order(s). Trying to save a new order now...`);
            }
            const newOrder = new (storeDBModel.getOrderModel())(Object.assign({}, req.body));
            const order = yield newOrder.save();
            //console.log(`save order result = ${JSON.stringify(order)}`);
            res.json(order);
        }
        catch (err) {
            console.log(`Error processing a /put Order request...`);
            console.error(err);
            res.status(500).json({ "error": err });
        }
    }
}));
app.get('/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //await checkDB();
    let order = yield storeDBModel.getOrderModel().find();
    if (order.length > 0) {
        res.set('Content-Type', 'application/json').json(order);
    }
    else {
        console.log(`Unable to find any orders`);
        res.sendStatus(404);
    }
}));
let listener = app.listen(() => {
    console.log();
    console.log(`Request to start Pizza store app received... [${util_1.default.inspect(listener.address(), false, null, true)}]`);
});
