"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnOrder = exports.AnItem = exports.APizza = void 0;
class AnOrder {
    constructor(orderID, customerName, customerAddress, items) {
        this.orderID = orderID;
        this.customerName = customerName;
        this.customerAddress = customerAddress;
        this.items = items;
    }
}
exports.AnOrder = AnOrder;
class APizza {
    constructor(name, ingredients) {
        this.name = name;
        this.ingredients = ingredients;
    }
}
exports.APizza = APizza;
class AnItem {
    constructor(pizza, price) {
        this.pizza = pizza;
        this.price = price;
    }
}
exports.AnItem = AnItem;
