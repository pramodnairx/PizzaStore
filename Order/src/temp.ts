import { Pizza } from "./model/order";

const pizzas = [(new class implements Pizza {name = "Margherita"; ingredients = "Cheese and more cheese";}())];

console.log(pizzas[0]);

/*
console.log(new class implements Pizza {
    name = "Margherita";
    ingredients = "Cheese and more cheese";
}());
*/


//console.log(myPizza.name);

//export {myPizza};