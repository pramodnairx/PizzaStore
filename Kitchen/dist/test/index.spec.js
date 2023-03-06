"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const supertest_1 = __importDefault(require("supertest"));
const axios_1 = __importDefault(require("axios"));
const kitchen_service_http_1 = require("../service/adapters/kitchen-service-http");
//let should = chai.should();
let expect = chai_1.default.expect;
let auth0Token /*: string*/ = "dummy";
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
                this.orderID = "000002";
                this.customerName = "Hungrier Jack";
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
        (0, supertest_1.default)(kitchen_service_http_1.app)
            .get('/')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
            expect(res.text).to.contain("Welcome");
            expect(res.text).to.contain("kitchen");
            done();
        }).catch(err => {
            done(err);
        });
    });
});
/*
describe('Put, Get and Delete a /Pizza', () => {

    before('Setup Auth0', getAuth0Token);

    it('it should PUT a new Pizza', (done) => {
        reset();
        request(app)
            .put('/pizza')
            .type('json')
            .set('Content-Type','application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .send(pizzas[0])
            .expect(200)
            .then(res => {
                let json = JSON.parse(res.text);
                expect(json.name).to.equal(pizzas[0].name);
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
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
                let json = JSON.parse(res.text);
                expect(json[0].ingredients).to.contain(pizzas[0].ingredients[0]);
                done();
            }).catch(err => {
                console.log(err);
                done(err);
            })
    });

    it('it should DELETE pizza details as per provided name', (done) => {
        reset();
        request(app)
            .delete(`/pizza/${pizzas[0].name}`)
            .type('json')
            .set('Content-Type','application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
                let json = JSON.parse(res.text);
                expect(json).to.equal(1);
                done();
            }).catch(err => {
                console.log(err);
                done(err);
            })
    });

});
*/
/*
describe('GET /auth ', () => {
    
    before('Setup Auth0', getAuth0Token);

    it('it should GET a secured auth page', (done) => {
        reset();
        request(app)
            .get('/auth')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
                expect(res.text).to.equal("Secured Resource");
                done();
            }).catch(err => {
                done(err);
            })
    });
});
*/
