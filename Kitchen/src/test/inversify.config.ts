import { Container } from "inversify";
import { PersistenceManager, TYPES } from "./../db/persistencemanager";
import { MockPersistenceManager } from "./mockpersistencemanager";
import { iocContainer } from "./../inversify.config"; //the base iocContainer

// We build on top of the base iocContainer only mocking the binding we are interested in
iocContainer.unbind(TYPES.PersistenceManager);
iocContainer.bind<PersistenceManager>(TYPES.PersistenceManager).to(MockPersistenceManager);

export { iocContainer };
