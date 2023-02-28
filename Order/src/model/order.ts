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


export { OrderSpec, PizzaSpec, ItemSpec }