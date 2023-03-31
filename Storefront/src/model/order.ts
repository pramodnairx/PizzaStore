enum OrderStatus {
    Initialized = "INIT",
    Acknowledged = "ACK",
    Processing = "PROC",
    Ready = "READY"
}

interface Order {  
    orderID: string;
    status: OrderStatus;
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


export { Order, Pizza, Item, OrderStatus }