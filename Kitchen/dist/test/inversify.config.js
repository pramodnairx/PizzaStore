"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iocContainer = void 0;
const persistencemanager_1 = require("./../db/persistencemanager");
const mockpersistencemanager_1 = require("./mockpersistencemanager");
const inversify_config_1 = require("./../inversify.config"); //the base iocContainer
Object.defineProperty(exports, "iocContainer", { enumerable: true, get: function () { return inversify_config_1.iocContainer; } });
// We build on top of the base iocContainer only mocking the binding we are interested in
inversify_config_1.iocContainer.unbind(persistencemanager_1.TYPES.PersistenceManager);
inversify_config_1.iocContainer.bind(persistencemanager_1.TYPES.PersistenceManager).to(mockpersistencemanager_1.MockPersistenceManager);
