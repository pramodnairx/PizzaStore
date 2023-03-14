import chai from 'chai';
import { randomBytes } from 'crypto';
import { Order, Pizza, Item, OrderStatus} from '../model/order';
import { KitchenService } from '../service/kitchen-service';
import {logger} from '../util/utils';
import config from 'config';
import { iocContainer } from './inversify.config';
import { TYPES, PersistenceManager } from '../db/persistencemanager';
import { MockPersistenceManager } from './mockpersistencemanager';

let expect = chai.expect;

let auth0Token/*: string*/ = "dummy";

let pizzas: Pizza[];
let items: Item[];
let orders: Order[];

const orderID1 = randomBytes(4).toString('hex');
const orderID2 = randomBytes(4).toString('hex');

let mockPM: PersistenceManager; 
let kitchen: KitchenService; 
let mockDBResponses: Map<string, Order>[] = [];

const reset = function() {
    pizzas = [(new class implements Pizza {name = "Margherita"; ingredients = ["Cheese and more cheese"]}()),
                (new class implements Pizza {name = "Meat Feast"; ingredients = ["Bacon", "Salami", "Sausage", "Anchovies"]}()),
                //(new class implements Pizza {name = "Hawaiian"; ingredients = "Pineapple, Prawns";}())
            ];
    
    items = [(new class implements Item{pizza = pizzas[0]; price = 18.95}()),
                (new class implements Item{pizza = pizzas[1]; price = 22.10}())
            ];
    
    orders = [(new class implements Order {orderID = orderID1; customerName = "Mock Hungrier Jack"; status = OrderStatus.Acknowledged; customerAddress = "213 Hungryville 3026"; items = [items[0], items[1]] }()),
              (new class implements Order {orderID = orderID2; customerName = "Mock Another Hungrier Jack"; status = OrderStatus.Acknowledged; customerAddress = "220 Hungryville 3026"; items = [items[1]] }()),
             ];
    // Array order is 0:get, 1:save, 2:delete, 3:update 
    mockDBResponses = [
        new Map().set(orderID2, orders[1]),
        new Map().set(orderID1, orders[0]).set(orderID2, orders[1]),
        new Map().set(orderID1, orders[0]).set(orderID2, orders[1]),
        new Map().set(orderID1, orders[0]).set(orderID2, orders[1]),
    ];
};


describe('Kitchen Service Tests', () => {
    
    before(async() => {
        reset();
        mockPM = iocContainer.get<PersistenceManager>(TYPES.PersistenceManager);
        if(mockPM instanceof MockPersistenceManager)
            mockPM.setMockResponses(mockDBResponses);
        kitchen = new KitchenService(mockPM);
    });
    
    it('Prepare and return an Acknowledged Order', async () => {
        reset();
        let order = await kitchen.processOrder(orders[0]);
        expect(order && order !== null);
        expect(order!.status).equals(OrderStatus.Ready);
        expect(order!.orderID).equals(orders[0].orderID);
    });

    it('Ignores an Order that is not in Acknowledged status', async () => {
        reset();
        orders[0].status = OrderStatus.Initialized;
        let order = await kitchen.processOrder(orders[0]);
        expect(!order);
    });
    
    it('Ignore a duplicate Order', async () => {
        reset();
        const order = await kitchen.processOrder(orders[0]);
        expect(order && order !== null);
        expect(order!.status).equals(OrderStatus.Ready);
        expect(order!.orderID).equals(orders[0].orderID);
        
        reset();
        mockDBResponses[0].set(orderID1, orders[0]);
        (mockPM as MockPersistenceManager).setMockResponses(mockDBResponses);        
        const repeatOrder = await kitchen.processOrder(orders[0]);
        expect(!repeatOrder);
    });

});
