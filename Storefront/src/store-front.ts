import util from 'util';
import express, { Express, Request, Response } from 'express';
//import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
//import { PersistenceManagerFactory } from '../../db/persistencemanager';
import config from 'config';
import { logger } from './util/utils';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
const jwtCheck = auth({
    audience: config.get(`orderService.auth.jwt.audience`),
    issuerBaseURL: config.get(`orderService.auth.jwt.issuerBaseURL`),
    tokenSigningAlg: config.get(`orderService.auth.jwt.tokenSigningAlg`)
  });

if(config.get(`orderService.auth.jwt.useJWT`) === 'true') {
    app.use(jwtCheck);
}
*/

app.get('/auth', (req: Request, res: Response) => {
    res.send(`Secured Resource`);
});

app.get('/', async (req: Request, res: Response) => {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
});

app.route('/order/:orderID')
    .get(async(req: Request, res: Response) => {
        let order = await orderService.getOrder(req.params.orderID);
        if(order) {
            res.set('Content-Type','application/json').json(order);
        } else {
            logger.info(`Unable to find Order with ID ${req.params.orderID}`);
            res.sendStatus(404);
        }
    })
    .delete(async(req: Request, res: Response) => {
        let order = await orderService.deleteOrder(req.params.orderID);
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
            let order = await orderService.addOrder({...req.body});
            res.set('Content-Type','application/json').json(order);
        } catch (err) {
            logger.warn(`Error processing a /put Order request...`);
            logger.warn(err);
            res.status(500).json({"error": err});
        }
    }
});

let listener = app.listen(() => {
    logger.info(`Request to start Pizza store order service received... [${util.inspect(listener.address(), false, null, true)}]`);
});

export {app};