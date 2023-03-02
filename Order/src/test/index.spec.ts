import chai from 'chai';
import request from 'supertest';
import axios from 'axios';
import { app } from '../service/order-service';
import { Order, Pizza, Item} from '../model/order';

//let should = chai.should();
let expect = chai.expect;

let auth0Token/*: string*/ = "dummy";

let pizzas: Pizza[];
let items: Item[];
let orders: Order[];

const reset = function() {
    pizzas = [(new class implements Pizza {name = "Margherita"; ingredients = ["Cheese and more cheese"]}()),
                (new class implements Pizza {name = "Meat Feast"; ingredients = ["Bacon", "Salami", "Sausage", "Anchovies"]}()),
                //(new class implements Pizza {name = "Hawaiian"; ingredients = "Pineapple, Prawns";}())
            ];
    
    items = [(new class implements Item{pizza = pizzas[0]; price = 18.95}()),
                (new class implements Item{pizza = pizzas[1]; price = 22.10}())
            ];
    
    orders = [(new class implements Order {orderID = "000002"; customerName = "Hungrier Jack"; customerAddress = "213 Hungryville 3026"; items = [items[0], items[1]] }())];
    
}

function getAuth0Token(done: Mocha.Done) {
    if(!auth0Token) {
        axios({
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
    } else {
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
        request(app)
            .get('/')
            .set('authorization', `Bearer ${auth0Token}`)            
            .expect(200)
            .then(res => {
                expect(res.text).to.contain("Welcome");
                done();
            }).catch(err => {
                done(err);
            })    
    });
});

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
                expect(json[0].name).to.equal(pizzas[0].name);
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


describe('Put, Get and Delete /Item', () => {

    before('Setup Auth0', getAuth0Token);

    it('it should PUT a new Item', (done) => {
        reset();
        request(app)
            .put('/item')
            .type('json')
            .set('Content-Type','application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .send(items[0])
            .expect(200)
            .then(res => {
                let json = JSON.parse(res.text);
                expect(json[0].pizza.name).to.equal(items[0].pizza.name);
                done();
            }).catch(err => {
                done(err);
            })
    });
    
    it('it should GET item details as per provided Pizza name', (done) => {
        reset();
        request(app)
            .get(`/item/${items[0].pizza.name}`)
            .type('json')
            .set('Content-Type','application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
                let json = JSON.parse(res.text);
                expect(json[0].price).to.equal(items[0].price);
                done();
            }).catch(err => {
                done(err);
            })
    });

    it('it should DELETE Items as per details provided', (done) => {
        reset();
        request(app)
            .delete(`/item/${items[0].pizza.name}`)
            .type('json')
            .set('Content-Type','application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .send(items[0])
            .expect(200)
            .then(res => {
                let json = JSON.parse(res.text);
                expect(json).to.equal(1);
                done();
            }).catch(err => {
                done(err);
            })
    });

});


describe('Put, Get and Delete an /Order', () => {

    before('Setup Auth0', getAuth0Token);
    
    it('it should PUT a new Order', (done) => {
        reset();
        request(app)
            .put('/order')
            .type('json')
            .set('Content-Type','application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .send(orders[0])
            .expect(200)
            .then(res => {
                let json = JSON.parse(res.text);
                expect(json[0].orderID).to.equal(orders[0].orderID);
                expect(json[0].items[0].pizza.name).to.equal(orders[0].items[0].pizza.name);
                done();
            }).catch(err => {
                done(err);
            })
    });
    
    it('it should GET order details as per provided OrderID', (done) => {
        reset();
        request(app)
            .get(`/order/${orders[0].orderID}`)
            .type('json')
            .set('Content-Type','application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            .expect(200)
            .then(res => {
                expect(res.body.orderID).to.equal(orders[0].orderID);
                expect(res.body.items[0].pizza.name).to.equal(orders[0].items[0].pizza.name);
                done();
            }).catch(err => {
                done(err);
            })
    });

    it('it should DELETE Orders as per details provided', (done) => {
        reset();
        request(app)
            .delete(`/order/${orders[0].orderID}`)
            .type('json')
            .set('Content-Type','application/json')
            .set('authorization', `Bearer ${auth0Token}`)
            //.send(orders[0])
            .expect(200)
            .then(res => {
                let json = JSON.parse(res.text);
                expect(json).to.equal(1);
                done();
            }).catch(err => {
                done(err);
            })
    });

});

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

