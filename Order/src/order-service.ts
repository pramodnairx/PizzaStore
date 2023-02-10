import util from 'util';
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { PizzaStoreModel } from './db/PizzaStoreDBModel';
import { Pizza } from './model/order';

let storeDBModel: PizzaStoreModel;

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function checkDB(){
    if(!storeDBModel) {
        //console.log(`Creating new Pizza Store DB Model`);
        storeDBModel = new PizzaStoreModel();
        await storeDBModel.setup();
    }
}

async function savePizza(req: Request) {
    const newPizza = new (storeDBModel.getPizzaModel())({...req.body});
    return newPizza.save();      
}

app.get('/', async (req: Request, res: Response) => {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
});

app.get('/pizza/:name', async(req: Request, res: Response) => {
    await checkDB();
    let pizza = await storeDBModel.getPizzaModel().find({"name": req.params.name});
    if( pizza.length > 0) {
        res.set('Content-Type','application/json').json(pizza);
    } else {
        console.log(`Unable to find pizza with name ${req.params.name}`);
        res.sendStatus(404);
    }
});

app.put('/pizza', async (req: Request, res: Response) => {
    await checkDB();
    console.log(req.headers);
    if(!req.body) {
        res.sendStatus(400);
    } else {
        //console.log(`Request body received as ${JSON.stringify(req.body)}`);
        try {
            if( (await storeDBModel.getPizzaModel().find({name: req.body.name})).length > 0){
                //console.log(`Found some pizzas to delete first`);
                let deletedPizzas = (await storeDBModel.getPizzaModel().deleteMany({name: req.body.name})).deletedCount;
                //console.log(`Successfully deleted ${deletedPizzas} pizza(s). Trying to save a new pizza now...`);
            }
            let pizza = await savePizza(req);
            //console.log(`save pizza result = ${JSON.stringify(pizza)}`);
            res.json(pizza);
        } catch (err) {
            console.log(`Error processing a /put pizza request...`);
            console.error(err);
            res.status(500).json({"error": err});
        }
    }
});



//Specific Order ID
app.route('/order/:oid')
    .get(async (req: Request, res: Response) => {
        res.send(`Retrieving Order details for Order ID ${req.params.oid}`);
    })
    .delete(async (req: Request, res: Response) => {
        res.send(`Deleting Order ID ${req.params.oid}`);
    });

let listener = app.listen(() => {
    console.log();
    console.log(`Request to start Pizza store app received... [${util.inspect(listener.address(), false, null, true)}]`);
});

export {app};