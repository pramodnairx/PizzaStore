import { Container } from "inversify";
import { PersistenceManager, MongoDBPersistenceManager, TYPES } from "./db/persistencemanager";

const iocContainer = new Container();

iocContainer.bind<PersistenceManager>(TYPES.PersistenceManager).to(MongoDBPersistenceManager);

export { iocContainer };
