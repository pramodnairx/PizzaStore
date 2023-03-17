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
//import { auth } from 'express-oauth2-jwt-bearer';
const dotenv_1 = __importDefault(require("dotenv"));
const utils_1 = require("./util/utils");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
/*
const jwtCheck = auth({
    audience: config.get(`orderService.auth.jwt.audience`),
    issuerBaseURL: config.get(`orderService.auth.jwt.issuerBaseURL`),
    tokenSigningAlg: config.get(`orderService.auth.jwt.tokenSigningAlg`)
  });

if(config.get(`orderService.auth.jwt.useJWT`) === 'true') {
    app.use(jwtCheck);
}
*/
app.get('/auth', (req, res) => {
    res.send(`Secured Resource`);
});
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
}));
app.route('/order/:orderID')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let order = yield orderService.getOrder(req.params.orderID);
    if (order) {
        res.set('Content-Type', 'application/json').json(order);
    }
    else {
        utils_1.logger.info(`Unable to find Order with ID ${req.params.orderID}`);
        res.sendStatus(404);
    }
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let order = yield orderService.deleteOrder(req.params.orderID);
    if (order > 0) {
        res.set('Content-Type', 'application/json').json(order);
    }
    else {
        utils_1.logger.info(`Unable to find Order with ID ${req.params.orderID}`);
        res.sendStatus(404);
    }
}));
app.put('/order', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.sendStatus(400);
    }
    else {
        try {
            let order = yield orderService.addOrder(Object.assign({}, req.body));
            res.set('Content-Type', 'application/json').json(order);
        }
        catch (err) {
            utils_1.logger.warn(`Error processing a /put Order request...`);
            utils_1.logger.warn(err);
            res.status(500).json({ "error": err });
        }
    }
}));
let listener = app.listen(() => {
    utils_1.logger.info(`Request to start Pizza store order service received... [${util_1.default.inspect(listener.address(), false, null, true)}]`);
});
