"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const chai_http_1 = __importDefault(require("chai-http"));
const index_1 = require("../index");
let should = chai_1.default.should();
chai_1.default.use(chai_http_1.default);
/*
let pizzas: Pizza[];
let items: Item[];
let orders: Order[];

const reset = function() {
    pizzas = [new Pizza('Margherita', ['Cheese', 'Tomato sauce', 'Dough']),
                            new Pizza('Meat Feast', ['Bacon', 'Sausage', 'Chicken']),
                            new Pizza('Aussie', ['Capsicum', 'Beetroot', 'Cheese']),
                            new Pizza('Tropicana', ['Pineapple', 'Bacon'])];
    items = [new Item(pizzas[0], 20.50),
                            new Item(pizzas[1], 21.80),
                            new Item(pizzas[2], 22.00),
                            new Item(pizzas[3], 24.50)];
    orders = [new Order('1234', 'Joe Hungry', '78 Eatville St.', [items[0], items[1]]),
                            new Order('3456', 'Adam Yummy', '32 Pizzalovers Cl.', [items[2], items[3]]),
                            new Order('5678', 'Lisa Lousy', '8 Hungergames Dr.', [items[1], items[2]]),
                            new Order('8901', 'Jabba the Hutt', '21 Intergalactic Ave.', [items[0], items[3]])];
}
*/
describe('orders', () => {
    beforeEach((done) => {
        //reset();
        done();
    });
});
describe('/GET', () => {
    it('it should GET a welcome page response', (done) => {
        chai_1.default.request(index_1.app)
            .get('/')
            .end((err, resp) => {
            resp.should.have.status(200);
            //resp.body.should.
            done();
        });
    });
});
describe('/POST Order', () => {
    it('it should Create a new Order', (done) => {
        chai_1.default.request(index_1.app)
            .post('/Order')
            .end((err, resp) => {
            resp.should.have.status(200);
            //resp.body.should.
            done();
        });
    });
});
