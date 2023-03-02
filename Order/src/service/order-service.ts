import util from 'util';
import express, { Express, Request, Response } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import { PersistenceManagerFactory } from '../db/persistencemanager';
import config from 'config';
import winston from 'winston';

const logger = winston.createLogger({
    level: `${config.get('orderService.logging.default')}`,
    format: winston.format.json(),
    //defaultMeta: { service: 'user-service' },
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        })
    ]
});

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const jwtCheck = auth({
    audience: config.get(`orderService.auth.jwt.audience`),
    issuerBaseURL: config.get(`orderService.auth.jwt.issuerBaseURL`),
    tokenSigningAlg: config.get(`orderService.auth.jwt.tokenSigningAlg`)
  });

if(config.get(`orderService.auth.jwt.useJWT`) === 'true') {
    app.use(jwtCheck);
}

const persistenceManager = PersistenceManagerFactory.getPersistenceManager();

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
            logger.info(`Unable to find pizza with name ${req.params.name}`);
            res.sendStatus(404);
        }
    })
    .delete(async(req: Request, res: Response) => {
        let deletedPizzas = await persistenceManager.deletePizzas([req.params.name]);
        if(deletedPizzas > 0) {
            res.set('Content-Type','application/json').json(deletedPizzas);
        } else {
            logger.info(`Unable to find pizza with name ${req.params.name}`);
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
            logger.warn(`Error processing a /put pizza request...`);
            logger.warn(err);
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
            logger.info(`Unable to find item with name ${req.params.pizza}`);
            res.sendStatus(404);
        }
    })
    .delete(async(req: Request, res: Response) => {
        let deletedCount = await persistenceManager.deleteItems([req.params.pizza]);
        if( deletedCount > 0) {
            res.set('Content-Type','application/json').json(deletedCount);
        } else {
            logger.info(`Unable to find item with name ${req.params.pizza}`);
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
            logger.warn(`Error processing a /put item request...`);
            logger.warn(err);
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
            logger.info(`Unable to find Order with ID ${req.params.orderID}`);
            res.sendStatus(404);
        }
    })
    .delete(async(req: Request, res: Response) => {
        let order = await persistenceManager.deleteOrders([req.params.orderID]);
        if(order > 0) {
            res.set('Content-Type','application/json').json(order);
        } else {
            logger.info(`Unable to find Order with ID ${req.params.orderID}`);
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
            logger.warn(`Error processing a /put Order request...`);
            logger.warn(err);
            res.status(500).json({"error": err});
        }
    }
});

let listener = app.listen(() => {
    logger.info(`Request to start Pizza store app received... [${util.inspect(listener.address(), false, null, true)}]`);
});

export {app};