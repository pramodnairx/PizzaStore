"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("../index");
//let should = chai.should();
let expect = chai_1.default.expect;
//chai.use(chaiHttp);
let pizzas;
let items;
let orders;
const reset = function () {
    pizzas = [(new class {
            constructor() {
                this.name = "Margherita";
                this.ingredients = "Cheese and more cheese";
            }
        }())];
    /*
    items = [new class implements Item {"pizza": pizzas[0];  "price": 20.50},
                            new class implements Item {"pizza": pizzas[1];  "price": 11.80},
                            new class implements Item {"pizza": pizzas[2];  "price": 24.10},
                            new class implements Item {"pizza": pizzas[3];  "price": 33},];
    
    
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
describe('/GET', () => {
    it('it should GET a welcome page response', (done) => {
        reset();
        (0, supertest_1.default)(index_1.app)
            .get('/')
            .expect(200)
            .then(res => {
            expect(res.text).to.contain("Welcome");
            done();
        }).catch(err => {
            done(err);
        });
    });
});
describe('Post /Pizza', () => {
    it('it should POST a new Pizza', (done) => {
        reset();
        (0, supertest_1.default)(index_1.app)
            .post('/pizza')
            .type('json')
            .set('Content-Type', 'application/json')
            .send(pizzas[0])
            .expect(200)
            .then(res => {
            expect(res.body.name).to.equal(pizzas[0].name);
            //assert(res.body.name, pizzas[0].name);
            done();
        }).catch(err => {
            done(err);
        });
    });
});
let objectToString = function (obj) {
    let output = "{ ";
    /*
    for(let key of Object.keys(obj)) {
        output.concat(`[` + key +  `] = `).concat((obj as any)[key].toString()).concat(`; `);
    }*/
    const keys = Object.keys(obj);
    keys.forEach((key, index) => {
        output.concat(`[` + key + `] = `).concat(obj[key].toString()).concat(`; `);
    });
    return output.concat(" }");
};
