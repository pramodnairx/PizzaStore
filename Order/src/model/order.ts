/*
class Order {    
    constructor(
        public orderID: string, 
        public customerName: string, 
        public customerAddress: string, 
        public items: Item[]) {
    }
}

class Pizza {
    constructor(
        public name: string,
        public ingredients: string[]
    ) {

    }
}

class Item {
    constructor(
        public pizza: Pizza,
        public price: number){
    }
}*/

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