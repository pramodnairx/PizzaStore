import { OrderSpec, PizzaSpec, ItemSpec } from '../model/order'; 
import mongoose, { Schema, Model } from 'mongoose';

class PizzaStoreModel {

    private connected = false;

    private pizzaSchema = new Schema<PizzaSpec>({
        name: {type: String, required: true},
        ingredients: {type: [String], required: true}
    });
    
    private itemSchema = new Schema<ItemSpec>({
        pizza: this.pizzaSchema,
        price: Number
    });
    
    private orderSchema = new Schema<OrderSpec>({
        orderID: String,
        customerName: String, 
        customerAddress: String, 
        items: [this.itemSchema]
    }); 
    
    private PizzaModel = mongoose.model<PizzaSpec>('Pizza', this.pizzaSchema);
    private ItemModel = mongoose.model<ItemSpec>('Item', this.itemSchema);
    private OrderModel = mongoose.model<OrderSpec>('Order', this.orderSchema);

    public async setup() {
        if(!this.connected) {
            try {
                console.log(`Initiating Mongo DB connectivity...`);
                await mongoose.connect('mongodb+srv://skywalker:EenieMynie8080@bazinga.zwxlq0g.mongodb.net/?retryWrites=true&w=majority');
                console.log(`Connected to Mongo DB. Connection ID = ${mongoose.connection.id}`);
                this.connected = true;
                mongoose.connection.on(`disconnected`, () => {
                    console.log(`Mongo DB disconnect event triggered.`);
                })
            } catch (error) {
                console.error(error);
                throw error;
            }
        }        
    }

    public getPizzaModel(): mongoose.Model<PizzaSpec> {
        return this.PizzaModel;
    }

    public getItemModel(): mongoose.Model<ItemSpec> {
        return this.ItemModel;
    }

    public getOrderModel(): mongoose.Model<OrderSpec> {
        return this.OrderModel;
    }

    public isConnected() {
        return this.connected;
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