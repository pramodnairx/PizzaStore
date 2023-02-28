interface OrderSpec {    
    orderID: string; 
    customerName: string; 
    customerAddress: string; 
    items: ItemSpec[];
}

interface PizzaSpec {
    name: string;
    ingredients: string[];
}

interface ItemSpec {
    pizza: PizzaSpec;
    price: number;
}

class Pizza implements PizzaSpec {
    name: string;
    ingredients: string[];

    constructor(name: string, ingredients: string[]) {
        this.name = name;
        this.ingredients = ingredients;
    }

    /**
     * 
     * @returns the pizza saved to persistent storage 
     */
    savePizza(): Pizza {
        return this;
    }

    /**
     * 
     * @returns an instance of the pizza deleted from persistent storage
     */
    deletePizza(): Pizza {
        return this;
    }

    /**
     * 
     * @param name name of the pizza to look for
     * @returns an array of Pizza's matching the name
     */
    static findPizza(name: string): Pizza[] {
        return [];
    }
}

export { OrderSpec, PizzaSpec, ItemSpec }