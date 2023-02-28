"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Pizza {
    constructor(name, ingredients) {
        this.name = name;
        this.ingredients = ingredients;
    }
    /**
     *
     * @returns the pizza saved to persistent storage
     */
    savePizza() {
        return this;
    }
    /**
     *
     * @returns an instance of the pizza deleted from persistent storage
     */
    deletePizza() {
        return this;
    }
    /**
     *
     * @param name name of the pizza to look for
     * @returns an array of Pizza's matching the name
     */
    static findPizza(name) {
        return [];
    }
}
