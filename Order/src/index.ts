import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import { Order, Pizza, Item } from './model/order'; 
import mongoose, { Schema, Model } from 'mongoose';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

const pizzaSchema = new Schema<Pizza>({
    name: String,
    ingredients: Array
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

app.get('/', async (req: Request, res: Response) => {
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
});

app.post('/order', async(req: Request, res: Response) => {
    const newOrder = new OrderModel({...req.body});
    await newOrder.save();
    res.send(`Order received`);
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
        await mongoose.connect('mongodb://skywalker:EenieMynie8080@bazinga.zwxlq0g.mongodb.net/test');
        app.listen(port, () => {
            console.log(`Pizza Store server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    } finally {
        if(mongoose.connection) {
            await mongoose.connection.destroy();
        }
        console.log('Mongoose DB connection destroyed');
    }
}

start();

export {app};