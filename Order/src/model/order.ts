interface Order {    
    orderID: string; 
    customerName: string; 
    customerAddress: string; 
    items: Item[];
}

interface Pizza {
    name: string;
    ingredients: string[];
}

interface Item {
    pizza: Pizza;
    price: number;
}

export { Order, Pizza, Item }