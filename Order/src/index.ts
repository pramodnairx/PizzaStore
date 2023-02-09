import express, { Express, Request, Response } from 'express';
import bodyParser, { BodyParser } from 'body-parser';
import dotenv from 'dotenv';
import { PizzaStoreModel } from './db/PizzaStoreDBModel';

let storeDBModel: PizzaStoreModel;

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

async function checkDB(){
    if(!storeDBModel) {
        console.log(`Creating new Pizza Store DB Model`);
        storeDBModel = new PizzaStoreModel();
        await storeDBModel.setup();
    }
}

app.get('/', async (req: Request, res: Response) => {
    //await checkDB();
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
});

app.post('/pizza', async(req: Request, res: Response) => {
    await checkDB();
    console.log(req.headers);
    if(!req.body) {
        res.status(400).send();
    } else {
        console.log(`Request body received as ${req.body}`);
        const newPizza = new (storeDBModel.getPizzaModel())({...req.body});
        newPizza.save((err, pizza) => {
            if(err) {
                console.log(`newPizza save errored`);
                console.error(err);
                res.status(500).json({"error": err.message});
            } else {
                console.log(`newPizza save successful - ${pizza}`);
                res.send(pizza);
            }
        });
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

app.listen(() => {
    app.use(express.json());
    //app.use(express.urlencoded({ extended: true }));
    console.log(`Request to start Pizza store app received...`);
});

/*
const start = async () => {
    try {
        app.listen(port, () => {
            console.log(`Pizza Store server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
*/

//start();

let objectToString = function(obj:Object): string {
    let output = "{ ";
    /*
    for(let key of Object.keys(obj)) {
        output.concat(`[` + key +  `] = `).concat((obj as any)[key].toString()).concat(`; `);
    }*/

    const keys = Object.keys(obj);
    keys.forEach((key, index) => {
        output.concat(`[` + key +  `] = `).concat((obj as any)[key].toString()).concat(`; `);
    });
    return output.concat(" }");
}

export {app};