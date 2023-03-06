import util from 'util';
import express, { Express, Request, Response } from 'express';
//import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
import config from 'config';
import { logger } from '../../util/utils';
import { KitchenService } from '../kitchen-service';


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

const kitchenService = new KitchenService();
kitchenService.init();

app.get('/auth', (req: Request, res: Response) => {
    res.send(`Secured Resource`);
});

app.get('/', async (req: Request, res: Response) => {
    res.send(`Welcome to the Pizza kitchen service. Your response status was - ${res.statusCode}`);
});

app.put('/order', async (req: Request, res: Response) => {
    if(!req.body) {
        res.sendStatus(400);
    } else if (!kitchenService.isReady()) {
        res.sendStatus(503); //Service unavailable
    } else {
        try {
            res.json(`The kitchen is closed right now`);
        } catch (err) {
            logger.warn(`Error processing a /put order request...`);
            logger.warn(err);
            res.status(500).json({"error": err});
        }
    }
});


let listener = app.listen(() => {
    logger.info(`Request to start Pizza kitchen service received... [${util.inspect(listener.address(), false, null, true)}]`);
});

export {app};