import config from 'config'; 
import { Item, Order, Pizza } from '../model/order';
import { PersistenceManagerFactory } from '../db/persistencemanager';
import { logger } from '../util/utils';

class OrderService {

    persistenceManager = PersistenceManagerFactory.getPersistenceManager();

    /**
     * 
     * @param pizzaName 
     * @returns array of pizza's matching the name. If no match an empty array is returned
     */
    public async getPizza(pizzaName: string): Promise<Pizza[]> {
        return await this.persistenceManager.getPizzas(pizzaName);
    }

    /**
     * Deletes any existing pizzas with the same name and adds a new pizza
     * 
     * @param pizza 
     * @returns the saved pizza as received from the backend
     */
    public async addPizza(pizza: Pizza): Promise<Pizza> {
        if( (await this.persistenceManager.getPizzas(pizza.name)).length > 0) {
            let deletedPizzas = await this.persistenceManager.deletePizzas([pizza.name]);
        }
        let savedPizzas =  await this.persistenceManager.savePizzas([pizza]);
        if(savedPizzas.length > 0) {
            return savedPizzas[0];
        } else {
            throw new Error(`Error adding a ${pizza.name} pizza.`);
        }
    }

    /**
     * Deletes all pizza's with the name as 
     * 
     * @param pizza 
     * @returns 
     */
    public async deletePizza(pizza: string): Promise<number> {
        return await this.persistenceManager.deletePizzas([pizza]);
    }


    /**
     * 
     * @param pizzaName 
     * @returns array of items's matching the name. If no match an empty array is returned
     */
    public async getItem(pizzaName: string): Promise<Item[]> {
        return await this.persistenceManager.getItems(pizzaName);
    }

    /**
     * Deletes any existing items with the same pizza name and adds a new item
     * 
     * @param item 
     * @returns the saved item as received from the backend
     */
    public async addItem(item: Item): Promise<Item> {
        if( (await this.persistenceManager.getItems(item.pizza.name)).length > 0) {
            let deletedItems = await this.persistenceManager.deleteItems([item.pizza.name]);
        }
        let savedItems =  await this.persistenceManager.saveItems([item]);
        if(savedItems.length > 0) {
            return savedItems[0];
        } else {
            throw new Error(`Error adding a ${item.pizza.name} item.`);
        }
    }

    /**
     * Deletes all items's with the pizza name provided 
     * 
     * @param pizza 
     * @returns 
     */
    public async deleteItem(pizza: string): Promise<number> {
        return await this.persistenceManager.deleteItems([pizza]);
    }

    /**
     * 
     * @param orderID 
     * @returns Order matching the name. If no match null is returned
     */
    public async getOrder(orderID: string): Promise<Order | null> {
        return await this.persistenceManager.getOrder(orderID);
    }

    /**
     * Deletes any existing order with the provided OrderID and adds a new one
     * 
     * @param orderID 
     * @returns the saved Order as received from the backend
     */
    public async addOrder(order: Order): Promise<Order> {
        if(await this.persistenceManager.getOrder(order.orderID)) {
            let deletedOrder = await this.persistenceManager.deleteOrders([order.orderID]);
        }
        let savedOrder =  await this.persistenceManager.saveOrders([order]);
        if(savedOrder.length > 0) {
            return savedOrder[0];
        } else {
            throw new Error(`Error adding Order no. ${order.orderID}`);
        }
    }

    /**
     * Deletes all Orders with the provided orderID 
     * 
     * @param orderID 
     * @returns 
     */
    public async deleteOrder(orderID: string): Promise<number> {
        return await this.persistenceManager.deleteOrders([orderID]);
    }

}

export { OrderService }