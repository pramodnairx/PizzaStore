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
const persistencemanager_1 = require("../../db/persistencemanager");
const config_1 = __importDefault(require("config"));
const winston_1 = __importDefault(require("winston"));
const order_service_1 = require("../order-service");
const logger = winston_1.default.createLogger({
    level: `${config_1.default.get('orderService.logging.default')}`,
    format: winston_1.default.format.json(),
    //defaultMeta: { service: 'user-service' },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.simple(),
        })
    ]
});
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const jwtCheck = (0, express_oauth2_jwt_bearer_1.auth)({
    audience: config_1.default.get(`orderService.auth.jwt.audience`),
    issuerBaseURL: config_1.default.get(`orderService.auth.jwt.issuerBaseURL`),
    tokenSigningAlg: config_1.default.get(`orderService.auth.jwt.tokenSigningAlg`)
});
if (config_1.default.get(`orderService.auth.jwt.useJWT`) === 'true') {
    app.use(jwtCheck);
}
const persistenceManager = persistencemanager_1.PersistenceManagerFactory.getPersistenceManager();
const orderService = new order_service_1.OrderService();
app.get('/auth', (req, res) => {
    res.send(`Secured Resource`);
});
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
}));
app.route('/pizza/:name')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pizza = yield orderService.getPizza(req.params.name);
    if (pizza.length > 0) {
        res.set('Content-Type', 'application/json').json(pizza);
    }
    else {
        logger.info(`Unable to find pizza with name ${req.params.name}`);
        res.sendStatus(404);
    }
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let deletedPizzas = yield orderService.deletePizza(req.params.name);
    if (deletedPizzas > 0) {
        res.set('Content-Type', 'application/json').json(deletedPizzas);
    }
    else {
        logger.info(`Unable to find pizza with name ${req.params.name}`);
        res.sendStatus(404);
    }
}));
app.put('/pizza', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        try {
            let pizza = yield orderService.addPizza(Object.assign({}, req.body));
            res.json(pizza);
        }
        catch (err) {
            logger.warn(`Error processing a /put pizza request...`);
            logger.warn(err);
            res.status(500).json({ "error": err });
        }
    }
}));
app.route('/item/:pizza')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let item = yield orderService.getItem(req.params.pizza);
    if (item && item.length > 0) {
        res.set('Content-Type', 'application/json').json(item);
    }
    else {
        logger.info(`Unable to find item with name ${req.params.pizza}`);
        res.sendStatus(404);
    }
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let deletedCount = yield orderService.deleteItem(req.params.pizza);
    if (deletedCount > 0) {
        res.set('Content-Type', 'application/json').json(deletedCount);
    }
    else {
        logger.info(`Unable to find item with name ${req.params.pizza}`);
        res.sendStatus(404);
    }
}));
app.put('/item', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        try {
            if ((yield orderService.getItem(req.body.pizza.name)).length > 0) {
                let deletedItems = (yield orderService.deleteItem(req.body.pizza.name));
            }
            const item = yield orderService.addItem(Object.assign({}, req.body));
            res.json(item);
        }
        catch (err) {
            logger.warn(`Error processing a /put item request...`);
            logger.warn(err);
            res.status(500).json({ "error": err });
        }
    }
}));
app.route('/order/:orderID')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let order = yield orderService.getOrder(req.params.orderID);
    if (order) {
        res.set('Content-Type', 'application/json').json(order);
    }
    else {
        logger.info(`Unable to find Order with ID ${req.params.orderID}`);
        res.sendStatus(404);
    }
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let order = yield orderService.deleteOrder(req.params.orderID);
    if (order > 0) {
        res.set('Content-Type', 'application/json').json(order);
    }
    else {
        logger.info(`Unable to find Order with ID ${req.params.orderID}`);
        res.sendStatus(404);
    }
}));
app.put('/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        try {
            if (yield orderService.getOrder(req.body.orderID)) {
                let deletedItems = (yield orderService.deleteOrder(req.body.orderID));
            }
            const orders = yield orderService.addOrder(Object.assign({}, req.body));
            res.json(orders);
        }
        catch (err) {
            logger.warn(`Error processing a /put Order request...`);
            logger.warn(err);
            res.status(500).json({ "error": err });
        }
    }
}));
let listener = app.listen(() => {
    logger.info(`Request to start Pizza store app received... [${util_1.default.inspect(listener.address(), false, null, true)}]`);
});
