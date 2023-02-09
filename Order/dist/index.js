"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const PizzaStoreDBModel_1 = require("./db/PizzaStoreDBModel");
let storeDBModel;
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const port = process.env.PORT;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
function checkDB() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!storeDBModel) {
            console.log(`Creating new Pizza Store DB Model`);
            storeDBModel = new PizzaStoreDBModel_1.PizzaStoreModel();
            yield storeDBModel.setup();
        }
    });
}
app.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //await checkDB();
    res.send(`Welcome to the Pizza Store. Your response status was - ${res.statusCode}`);
}));
app.post('/pizza', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield checkDB();
    console.log(req.headers);
    if (!req.body) {
        res.status(400).send();
    }
    else {
        console.log(`Request body received as ${req.body}`);
        const newPizza = new (storeDBModel.getPizzaModel())(Object.assign({}, req.body));
        newPizza.save((err, pizza) => {
            if (err) {
                console.log(`newPizza save errored`);
                console.error(err);
                res.status(500).json({ "error": err.message });
            }
            else {
                console.log(`newPizza save successful - ${pizza}`);
                res.send(pizza);
            }
        });
    }
}));
//Specific Order ID
app.route('/order/:oid')
    .get((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Retrieving Order details for Order ID ${req.params.oid}`);
}))
    .delete((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.send(`Deleting Order ID ${req.params.oid}`);
}));
app.listen(() => {
    app.use(express_1.default.json());
    //app.use(express.urlencoded({ extended: true }));
    console.log(`Request to start Pizza store app received...`);
});
/*
const start = async () => {
    try {
        app.listen(port, () => {
            console.log(`Pizza Store server running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}
*/
//start();
let objectToString = function (obj) {
    let output = "{ ";
    /*
    for(let key of Object.keys(obj)) {
        output.concat(`[` + key +  `] = `).concat((obj as any)[key].toString()).concat(`; `);
    }*/
    const keys = Object.keys(obj);
    keys.forEach((key, index) => {
        output.concat(`[` + key + `] = `).concat(obj[key].toString()).concat(`; `);
    });
    return output.concat(" }");
};
