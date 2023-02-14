"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const supertest_1 = __importDefault(require("supertest"));
const order_service_1 = require("../order-service");
//let should = chai.should();
let expect = chai_1.default.expect;
let pizzas;
let items;
let orders;
const reset = function () {
    pizzas = [(new class {
            constructor() {
                this.name = "Margherita";
                this.ingredients = ["Cheese and more cheese"];
            }
        }()),
        (new class {
            constructor() {
                this.name = "Meat Feast";
                this.ingredients = ["Bacon", "Salami", "Sausage", "Anchovies"];
            }
        }()),
        //(new class implements Pizza {name = "Hawaiian"; ingredients = "Pineapple, Prawns";}())
    ];
    items = [(new class {
            constructor() {
                this.pizza = pizzas[0];
                this.price = 18.95;
            }
        }()),
        (new class {
            constructor() {
                this.pizza = pizzas[1];
                this.price = 22.10;
            }
        }())
    ];
    /*
    orders = [new AnOrder('1234', 'Joe Hungry', '78 Eatville St.', [items[0], items[1]]),
                            new AnOrder('3456', 'Adam Yummy', '32 Pizzalovers Cl.', [items[2], items[3]]),
                            new AnOrder('5678', 'Lisa Lousy', '8 Hungergames Dr.', [items[1], items[2]]),
                            new AnOrder('8901', 'Jabba the Hutt', '21 Intergalactic Ave.', [items[0], items[3]])];
                            */
};
//let server: request.SuperTest<request.Test>;
/*
describe('setup', () => {
    before((done) => {
        //server = request(app);
    });
});

describe('teardown', () => {
    after((done) => {
        //app.
    });
});
*/
/*
describe('/GET', () => {
    it('it should GET a welcome page response', (done) => {
        reset();
        request(app)
            .get('/')
            .expect(200)
            .then(res => {
                expect(res.text).to.contain("Welcome");
                done();
            }).catch(err => {
                done(err);
            })
    });
});
*/
/*
describe('Put and Get /Pizza', () => {

    it('it should PUT a new Pizza', (done) => {
        reset();
        request(app)
            .put('/pizza')
            .type('json')
            .set('Content-Type','application/json')
            .send(pizzas[0])
            .expect(200)
            .then(res => {
                //console.log(JSON.stringify(res));
                expect(res.body.name).to.equal(pizzas[0].name);
                done();
            }).catch(err => {
                done(err);
            })
    });

    
    it('it should GET pizza details as per provided name', (done) => {
        reset();
        request(app)
            .get(`/pizza/${pizzas[0].name}`)
            .type('json')
            .set('Content-Type','application/json')
            .expect(200)
            .then(res => {
                //console.log(JSON.stringify(res));
                let json = JSON.parse(res.text);
                //console.log(json);
                expect(json[0].ingredients).to.contain("Cheese and more cheese");
                done();
            }).catch(err => {
                done(err);
            })
    });
});
*/
describe('Put and Get /Item', () => {
    it('it should PUT a new Item', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .put('/item')
            .type('json')
            .set('Content-Type', 'application/json')
            .send(items[0])
            .expect(200)
            .then(res => {
            console.log(JSON.stringify(res));
            expect(res.body.pizza.name).to.equal(items[0].pizza.name);
            done();
        }).catch(err => {
            done(err);
        });
    });
    it('it should GET item details as per provided Pizza name', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .get(`/item/${items[0].pizza.name}`)
            .type('json')
            .set('Content-Type', 'application/json')
            .expect(200)
            .then(res => {
            //console.log(JSON.stringify(res));
            let json = JSON.parse(res.text);
            //console.log(json);
            expect(json.price).to.equal(items[0].price);
            done();
        }).catch(err => {
            done(err);
        });
    });
});
