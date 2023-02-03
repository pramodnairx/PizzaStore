import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Order, Pizza, Item } from './model/order'; 
import mongoose, { Schema, Model } from 'mongoose';

console.log(`Index.ts -> we are being loaded!`);

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const pizzaSchema = new Schema<Pizza>({
    name: {type: String, required: true},
    ingredients: {type: String, required: true}
});

const itemSchema = new Schema<Item>({
    pizza: [pizzaSchema],
    price: Number
});

const orderSchema = new Schema<Order>({
    orderID: String,
    customerName: String, 
    customerAddress: String, 
    items: [itemSchema]
}); 

const PizzaModel = mongoose.model<Pizza>('Pizza', pizzaSchema);
const ItemModel = mongoose.model<Item>('Item', itemSchema);
const OrderModel = mongoose.model<Order>('Order', orderSchema);

try {
    mongoose.connect('mongodb+srv://skywalker:EenieMynie8080@bazinga.zwxlq0g.mongodb.net/?retryWrites=true&w=majority')
    .then(() => {
        console.log("Connected to Mongo DB");
    });
    
    /*
    app.listen(port, () => {
        console.log(`Pizza Store server running at http://localhost:${port}`);
    });
    */
} catch (error) {
    console.error(error);
    process.exit(1);
}

app.get('/', async (req: Request, res: Response) => {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
});

app.post('/order', async(req: Request, res: Response) => {
    const newOrder = new OrderModel({...JSON.parse(req.body)});
    newOrder.save((err) => {
        console.error(err);
    });
    res.send(`Order received`);
});

app.post('/pizza', async(req: Request, res: Response) => {
    console.log(`Received pizza post as unparsed : ${req.body}`);
    const newPizza = new PizzaModel({...JSON.parse(req.body)});
    newPizza.save((err) => {
        console.error(err);
    });
    res.send(`Pizza received`);
});

//Specific Order ID
app.route('/order/:oid')
    .get(async (req: Request, res: Response) => {
        res.send(`Retrieving Order details for Order ID ${req.params.oid}`);
    })
    .delete(async (req: Request, res: Response) => {
        res.send(`Deleting Order ID ${req.params.oid}`);
    });

const start = async () => {
    try {
        /*
        app.listen(port, () => {
            console.log(`Pizza Store server running at http://localhost:${port}`);
        });
        */
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        /*         
        if(mongoose.connection) {
            await mongoose.connection.destroy();
        }
        console.log('Mongoose DB connection destroyed');
        */
    }
}

//start();

export {app};