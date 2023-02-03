import chai from 'chai';
import chaiHttp from 'chai-http';
import { app } from '../index';
import { Order, Pizza, Item, AnOrder, APizza, AnItem } from '../model/order';

let should = chai.should();
chai.use(chaiHttp);


let pizzas: APizza[];
let items: AnItem[];
let orders: AnOrder[];

const reset = function() {
    pizzas = [new APizza('Margherita', ['Cheese', 'Tomato sauce', 'Dough'].toString()), 
                            new APizza('Meat Feast', ['Bacon', 'Sausage', 'Chicken'].toString()),
                            new APizza('Aussie', ['Capsicum', 'Beetroot', 'Cheese'].toString()),
                            new APizza('Tropicana', ['Pineapple', 'Bacon'].toString())];
    items = [new AnItem(pizzas[0], 20.50),
                            new AnItem(pizzas[1], 21.80),
                            new AnItem(pizzas[2], 22.00),
                            new AnItem(pizzas[3], 24.50)];
    orders = [new AnOrder('1234', 'Joe Hungry', '78 Eatville St.', [items[0], items[1]]),
                            new AnOrder('3456', 'Adam Yummy', '32 Pizzalovers Cl.', [items[2], items[3]]),
                            new AnOrder('5678', 'Lisa Lousy', '8 Hungergames Dr.', [items[1], items[2]]),
                            new AnOrder('8901', 'Jabba the Hutt', '21 Intergalactic Ave.', [items[0], items[3]])];
}


describe('setup', () => {
    before((done) => {
        
    });
});

describe('/GET', () => {
    it('it should GET a welcome page response', (done) => {
        reset();
        chai.request(app)
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
        chai.request(app)
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

