import { Order, Pizza, Item } from '../model/order'; 
import mongoose, { Schema, Model } from 'mongoose';

class PizzaStoreModel {

    private connected = false;

    private pizzaSchema = new Schema<Pizza>({
        name: {type: String, required: true},
        ingredients: {type: [String], required: true}
    });
    
    private itemSchema = new Schema<Item>({
        pizza: this.pizzaSchema,
        price: Number
    });
    
    private orderSchema = new Schema<Order>({
        orderID: String,
        customerName: String, 
        customerAddress: String, 
        items: [this.itemSchema]
    }); 
    
    private PizzaModel = mongoose.model<Pizza>('Pizza', this.pizzaSchema);
    private ItemModel = mongoose.model<Item>('Item', this.itemSchema);
    private OrderModel = mongoose.model<Order>('Order', this.orderSchema);

    constructor(){
    }

    public async setup() {
        if(!this.connected) {
            try {
                console.log(`Initiating Mongo DB connectivity...`);
                await mongoose.connect('mongodb+srv://skywalker:EenieMynie8080@bazinga.zwxlq0g.mongodb.net/?retryWrites=true&w=majority')
                .then(() => {
                    console.log(`Connected to Mongo DB. Connection ID = ${mongoose.connection.id}`);
                    this.connected = true;
                    mongoose.connection.on(`disconnected`, () => {
                        console.log(`Mongo DB disconnect event triggered.`);
                    });
                })
            } catch (error) {
                console.error(error);
                throw error;
            }
        }        
    }

    public getPizzaModel(): mongoose.Model<Pizza> {
        return this.PizzaModel;
    }

    public getItemModel(): mongoose.Model<Item> {
        return this.ItemModel;
    }

    public getOrderModel(): mongoose.Model<Order> {
        return this.OrderModel;
    }

    public async disconnect() {
        if(this.connected && mongoose.connection) {
            console.log(`Disconnecting Mongo DB connection`);
            await mongoose.connection.close();
            console.log(`Mongo DB disconnected`);
        } else {
            console.log(`No active Mongo DB connection to disconnect`);
        }
        
    }

}

export { PizzaStoreModel };