"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const supertest_1 = __importDefault(require("supertest"));
const axios_1 = __importDefault(require("axios"));
const order_service_1 = require("../order-service");
//let should = chai.should();
let expect = chai_1.default.expect;
let auth0Token;
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
    orders = [(new class {
            constructor() {
                this.orderID = "000001";
                this.customerName = "Hungry Jack";
                this.customerAddress = "213 Hungryville 3026";
                this.items = [items[0], items[1]];
            }
        }())];
};
function getAuth0Token(done) {
    if (!auth0Token) {
        (0, axios_1.default)({
            method: 'post',
            url: 'https://dev-wmzvd34fb17s8ovr.us.auth0.com/oauth/token',
            headers: { 'content-type': 'application/json' },
            data: {
                client_id: 'Eg1qYpSuHhqsvJOihHTeNz7wwZ6ioSyM',
                client_secret: 'pogPsWNe3OmgGpunA_C7OyorNU2ckFF0pThQ4vg7nEWDpZzkRtlAS4Y9nJeE1b50',
                audience: 'https://pizzaorderservice.pramodnairx',
                grant_type: 'client_credentials'
            }
        })
            .then(response => {
            auth0Token = response.data.access_token;
            done();
        })
            .catch(err => {
            console.error(err);
            done(err);
        });
    }
    else {
        done();
    }
}
/*
describe('teardown', () => {
    after((done) => {
        //app.
    });
});
*/
describe('/GET', () => {
    before('Setup Auth0', getAuth0Token);
    it('it should GET a welcome page response', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .get('/')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
            expect(res.text).to.contain("Welcome");
            done();
        }).catch(err => {
            done(err);
        });
    });
});
describe('Put and Get /Pizza', () => {
    before('Setup Auth0', getAuth0Token);
    it('it should PUT a new Pizza', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .put('/pizza')
            .type('json')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .send(pizzas[0])
            .expect(200)
            .then(res => {
            //console.log(JSON.stringify(res));
            expect(res.body.name).to.equal(pizzas[0].name);
            done();
        }).catch(err => {
            done(err);
        });
    });
    it('it should GET pizza details as per provided name', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .get(`/pizza/${pizzas[0].name}`)
            .type('json')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
            //console.log(JSON.stringify(res));
            let json = JSON.parse(res.text);
            //console.log(json);
            expect(json[0].ingredients).to.contain(pizzas[0].ingredients[0]);
            done();
        }).catch(err => {
            done(err);
        });
    });
});
describe('Put and Get /Item', () => {
    before('Setup Auth0', getAuth0Token);
    it('it should PUT a new Item', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .put('/item')
            .type('json')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .send(items[0])
            .expect(200)
            .then(res => {
            //console.log(JSON.stringify(res));
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
            .set('authorization', `Bearer ${auth0Token}`)
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
describe('Put and Get /Order', () => {
    before('Setup Auth0', getAuth0Token);
    it('it should PUT a new Order', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .put('/order')
            .type('json')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .send(orders[0])
            .expect(200)
            .then(res => {
            //console.log(JSON.stringify(res));
            expect(res.body.orderID).to.equal(orders[0].orderID);
            expect(res.body.items[0].pizza.name).to.equal(orders[0].items[0].pizza.name);
            done();
        }).catch(err => {
            done(err);
        });
    });
    it('it should GET order details as per provided OrderID', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .get(`/order/${orders[0].orderID}`)
            .type('json')
            .set('Content-Type', 'application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
            //console.log(JSON.stringify(res));
            let json = JSON.parse(res.text);
            //console.log(json);
            expect(json[0].orderID).to.equal(orders[0].orderID);
            expect(json[0].items[0].pizza.name).to.equal(orders[0].items[0].pizza.name);
            done();
        }).catch(err => {
            done(err);
        });
    });
});
describe('GET /auth ', () => {
    before('Setup Auth0', getAuth0Token);
    it('it should GET a secured auth page', (done) => {
        reset();
        (0, supertest_1.default)(order_service_1.app)
            .get('/auth')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
            expect(res.text).to.equal("Secured Resource");
            done();
        }).catch(err => {
            done(err);
        });
    });
});
