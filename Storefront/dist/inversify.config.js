"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iocContainer = void 0;
const inversify_1 = require("inversify");
const persistencemanager_1 = require("./db/persistencemanager");
const iocContainer = new inversify_1.Container();
exports.iocContainer = iocContainer;
iocContainer.bind(persistencemanager_1.TYPES.PersistenceManager).to(persistencemanager_1.MongoDBPersistenceManager);
