import { Order, Pizza, Item } from '../model/order'; 
import mongoose, { Schema } from 'mongoose';
import config from 'config';
import { logger } from '../util/utils';

class StoreFrontMongoDBModel {
    
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

    public async setup() {
        if(!this.connected) {
            try {
                logger.info(`Initiating Mongo DB connectivity...`);
                await mongoose.connect(config.get(`storeFrontService.db.connectionString`));
                logger.info(`Connected to Mongo DB. Connection ID = ${mongoose.connection.id}`);
                this.connected = true;
                mongoose.connection.on(`disconnected`, () => {
                    logger.info(`Mongo DB disconnect event triggered.`);
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

    public isConnected() {
        return this.connected;
    } 

    public async disconnect() {
        if(this.connected && mongoose.connection) {
            logger.info(`Disconnecting Mongo DB connection`);
            await mongoose.connection.close();
            logger.info(`Mongo DB disconnected`);
        } else {
            logger.info(`No active Mongo DB connection to disconnect`);
        }
    }

}

export { StoreFrontMongoDBModel };