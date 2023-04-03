import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { randomBytes } from 'crypto';
import { Order, Pizza, Item, OrderStatus} from '../model/order';
import { StoreFrontService } from '../service/storefront-service';
import {logger} from '../util/utils';
import config from 'config';
import { iocContainer } from './inversify.config';
import { TYPES, PersistenceManager } from '../db/persistencemanager';
import { MockPersistenceManager } from './mockpersistencemanager';

chai.use(chaiAsPromised);
let expect = chai.expect;

//var chaiAsPromised = require("chai-as-promised");


let auth0Token/*: string*/ = "dummy";

let pizzas: Pizza[];
let items: Item[];
let orders: Order[];

const orderID0 = randomBytes(4).toString('hex');
const orderID1 = randomBytes(4).toString('hex');

let mockPM: PersistenceManager; 
let storeFront: StoreFrontService; 
let mockDBResponses: Map<string, Order>[] = [];

const reset = function() {
    pizzas = [(new class implements Pizza {name = "Cheesios"; ingredients = ["Cheese and more cheese"]}()),
                (new class implements Pizza {name = "Carnivora"; ingredients = ["Bacon", "Salami", "Sausage", "Anchovies"]}()),
                //(new class implements Pizza {name = "Hawaiian"; ingredients = "Pineapple, Prawns";}())
            ];
    
    items = [(new class implements Item{pizza = pizzas[0]; price = 18.95}()),
                (new class implements Item{pizza = pizzas[1]; price = 22.10}())
            ];
    
    orders = [(new class implements Order {orderID = orderID0; customerName = "Mock McD"; status = OrderStatus.Initialized; customerAddress = "213 Hungryville 3026"; items = [items[0], items[1]] }()),
              (new class implements Order {orderID = orderID0; customerName = "Mock McD"; status = OrderStatus.Acknowledged; customerAddress = "213 Hungryville 3026"; items = [items[0], items[1]] }()),
              (new class implements Order {orderID = orderID1; customerName = "Mock Burger King"; status = OrderStatus.Ready; customerAddress = "220 Hungryville 3026"; items = [items[1]] }()),
             ];
    // Array order is 0:get, 1:save, 2:delete, 3:update 
    mockDBResponses = [];
};


describe('Store Front Service Tests', () => {
    
    before(async() => {
        reset();
        mockPM = iocContainer.get<PersistenceManager>(TYPES.PersistenceManager);
        if(mockPM instanceof MockPersistenceManager)
            mockPM.setMockResponses(mockDBResponses);
        storeFront = new StoreFrontService(mockPM);
    });
    
    it('Initiate a valid order and verify it is in acknowledged state', async () => {
        reset();
        if(mockPM instanceof MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set(orderID0, undefined),
                new Map().set(orderID0, orders[1]),
            ]); 
        }       

        let order = await storeFront.initiateOrder(orders[0]);
        expect(order && order !== null);
        expect(order!.status).equals(OrderStatus.Acknowledged);
        expect(order!.orderID).equals(orders[0].orderID);
    });

    it('Initiate an already Ready order and verify it is discarded', async () => {
        reset();
        if(mockPM instanceof MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set(orderID1, undefined),
            ]); 
        }       
        
        let order = await storeFront.initiateOrder(orders[2]);
        expect(!order);
    });

    it('Initiate a duplicate order and verify it is discarded', async () => {
        reset();
        if(mockPM instanceof MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set(orderID0, orders[1]),
            ]); 
        }       
        
        let order = await storeFront.initiateOrder(orders[0]);
        expect(!order);
    });

    it('Check status of a valid acknowldged order as Acknowledged', async () => {
        reset();
        if(mockPM instanceof MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set(orderID0, orders[1]),
            ]); 
        }       
        
        let orderStatus = await storeFront.getOrderStatus(orders[0].orderID);
        expect(orderStatus);
        expect(orderStatus).equals(OrderStatus.Acknowledged);
    });

    it('Check status of an invalid order ID and verify an exception is thrown', async () => {
        reset();
        if(mockPM instanceof MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set("dummy", orders[1]),
            ]); 
        }       
        
        expect(storeFront.getOrderStatus("")).to.be.rejectedWith(Error);
    });

    it('Check status of a non-existent order ID and verify an undefined value is received', async () => {
        reset();
        if(mockPM instanceof MockPersistenceManager) {
            mockPM.setMockResponses([
                new Map().set("dummy", orders[1]),
            ]); 
        }       
        
        expect(!storeFront.getOrderStatus("does-not-exist"));
    });


});
