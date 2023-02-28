import util from 'util';
import express, { Express, Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import { PizzaStoreModel } from './db/PizzaStoreDBModel';
import { PersistenceManagerFactory } from './db/persistencemanager';

let storeDBModel: PizzaStoreModel;

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
const jwtCheck = auth({
    audience: 'https://pizzaorderservice.pramodnairx',
    issuerBaseURL: 'https://dev-wmzvd34fb17s8ovr.us.auth0.com/',
    tokenSigningAlg: 'RS256'
  });
app.use(jwtCheck);
*/

const persistenceManager = PersistenceManagerFactory.getPersistenceManager(PersistenceManagerFactory.MONGO_DB);

async function savePizza(req: Request) {
    const newPizza = new (storeDBModel.getPizzaModel())({...req.body});
    return newPizza.save();      
}

app.get('/auth', (req: Request, res: Response) => {
    res.send(`Secured Resource`);
});

app.get('/', async (req: Request, res: Response) => {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
});

app.route('/pizza/:name')
    .get(async(req: Request, res: Response) => {
        let pizza = await persistenceManager.getPizzas(req.params.name);
        if( pizza.length > 0) {
            res.set('Content-Type','application/json').json(pizza);
        } else {
            console.log(`Unable to find pizza with name ${req.params.name}`);
            res.sendStatus(404);
        }
    })
    .delete(async(req: Request, res: Response) => {
        let deletedPizzas = await persistenceManager.deletePizzas([req.params.name]);
        if(deletedPizzas > 0) {
            res.set('Content-Type','application/json').json(deletedPizzas);
        } else {
            console.log(`Unable to find pizza with name ${req.params.name}`);
            res.sendStatus(404);
        }
    });

app.put('/pizza', async (req: Request, res: Response) => {
    if(!req.body) {
        res.sendStatus(400);
    } else {
        try {
            if( (await persistenceManager.getPizzas(req.body.name)).length > 0) {
                let deletedPizzas = await persistenceManager.deletePizzas([req.params.name]);
            }
            let pizza = await persistenceManager.savePizzas([{...req.body}]);
            res.json(pizza);
        } catch (err) {
            console.log(`Error processing a /put pizza request...`);
            console.error(err);
            res.status(500).json({"error": err});
        }
    }
});

app.route('/item/:pizza')
    .get(async(req: Request, res: Response) => {
        let item = await persistenceManager.getItems(req.params.pizza);
        if( item && item.length > 0) {
            res.set('Content-Type','application/json').json(item);
        } else {
            console.log(`Unable to find item with name ${req.params.pizza}`);
            res.sendStatus(404);
        }
    })
    .delete(async(req: Request, res: Response) => {
        let deletedCount = await persistenceManager.deleteItems([req.params.pizza]);
        if( deletedCount > 0) {
            res.set('Content-Type','application/json').json(deletedCount);
        } else {
            console.log(`Unable to find item with name ${req.params.pizza}`);
            res.sendStatus(404);
        }
    });

app.put('/item', async (req: Request, res: Response) => {
    if(!req.body) {
        res.sendStatus(400);
    } else {
        try {
            if( (await persistenceManager.getItems(req.body.pizza.name)).length > 0) {
                //console.log(`Found some items to delete first`);
                let deletedItems = (await persistenceManager.deleteItems([req.body.pizza.name]));
                //console.log(`Successfully deleted ${deletedItems} items(s). Trying to save a new item now...`);
            }
            const item = await persistenceManager.saveItems([{...req.body}]);
            res.json(item);
        } catch (err) {
            console.log(`Error processing a /put item request...`);
            console.error(err);
            res.status(500).json({"error": err});
        }
    }
});

app.route('/order/:orderID')
    .get(async(req: Request, res: Response) => {
        let order = await persistenceManager.getOrder(req.params.orderID);
        if(order) {
            res.set('Content-Type','application/json').json(order);
        } else {
            console.log(`Unable to find Order with ID ${req.params.orderID}`);
            res.sendStatus(404);
        }
    })
    .delete(async(req: Request, res: Response) => {
        let order = await persistenceManager.deleteOrders([req.params.orderID]);
        if(order > 0) {
            res.set('Content-Type','application/json').json(order);
        } else {
            console.log(`Unable to find Order with ID ${req.params.orderID}`);
            res.sendStatus(404);
        }
    });

app.put('/order', async (req: Request, res: Response) => {
    if(!req.body) {
        res.sendStatus(400);
    } else {
        try {
            if(await persistenceManager.getOrder(req.body.orderID)){
                let deletedItems = (await persistenceManager.deleteOrders([req.body.orderID]));
            }
            const orders = await persistenceManager.saveOrders([{...req.body}]);
            res.json(orders);
        } catch (err) {
            console.log(`Error processing a /put Order request...`);
            console.error(err);
            res.status(500).json({"error": err});
        }
    }
});

app.get('/order', async (req: Request, res: Response) => {
    //await checkDB();
    let order = await storeDBModel.getOrderModel().find();
    if( order.length > 0) {
        res.set('Content-Type','application/json').json(order);
    } else {
        console.log(`Unable to find any orders`);
        res.sendStatus(404);
    }
});

let listener = app.listen(() => {
    console.log();
    console.log(`Request to start Pizza store app received... [${util.inspect(listener.address(), false, null, true)}]`);
});

export {app};