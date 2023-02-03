"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const index_1 = require("../index");
const order_1 = require("../model/order");
let should = chai_1.default.should();
chai_1.default.use(chai_http_1.default);
let pizzas;
let items;
let orders;
const reset = function () {
    pizzas = [new order_1.APizza('Margherita', ['Cheese', 'Tomato sauce', 'Dough'].toString()),
        new order_1.APizza('Meat Feast', ['Bacon', 'Sausage', 'Chicken'].toString()),
        new order_1.APizza('Aussie', ['Capsicum', 'Beetroot', 'Cheese'].toString()),
        new order_1.APizza('Tropicana', ['Pineapple', 'Bacon'].toString())];
    items = [new order_1.AnItem(pizzas[0], 20.50),
        new order_1.AnItem(pizzas[1], 21.80),
        new order_1.AnItem(pizzas[2], 22.00),
        new order_1.AnItem(pizzas[3], 24.50)];
    orders = [new order_1.AnOrder('1234', 'Joe Hungry', '78 Eatville St.', [items[0], items[1]]),
        new order_1.AnOrder('3456', 'Adam Yummy', '32 Pizzalovers Cl.', [items[2], items[3]]),
        new order_1.AnOrder('5678', 'Lisa Lousy', '8 Hungergames Dr.', [items[1], items[2]]),
        new order_1.AnOrder('8901', 'Jabba the Hutt', '21 Intergalactic Ave.', [items[0], items[3]])];
};
describe('orders', () => {
    beforeEach((done) => {
        done();
    });
});
describe('/GET', () => {
    it('it should GET a welcome page response', (done) => {
        reset();
        chai_1.default.request(index_1.app)
            //.keepOpen()
            .get('/')
            .end((err, resp) => {
            resp.should.have.status(200);
            //resp.body.should.
            done();
        });
    });
});
/*
describe('/POST Order', () => {
    it('it should Create a new Order', (done) => {
        reset();
        chai.request(app)
            .post('/order')
            .send(JSON.stringify(orders[0]))
            .end((err, resp) => {
                resp.should.have.status(200);
                //resp.body.should.
                done();
            });
    });
});
*/
describe('/POST Pizza', () => {
    it('it should Create a new Pizza in the menu', (done) => {
        reset();
        console.log(`Posting Pizza unstringified ${JSON.stringify(pizzas[0])}`);
        chai_1.default.request(index_1.app)
            .post('/pizza')
            .type('json')
            .send(JSON.stringify(pizzas[0]))
            .end((resp) => {
            console.log(`Processing /POST pizza response...${resp.status}`);
            resp.should.have.status(200);
            done();
        });
    });
});
