/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// file deepcode ignore no-any: any needed
// file deepcode ignore object-literal-shorthand: argh
import {
  Handler,
  MongoPersistence,
  PersistenceInfo,
} from 'flexiblepersistence';
import { DatabaseHandler } from 'backapi';
import TestService from './testService';
import { eventInfo, readInfo } from './databaseInfos';
import { ServiceHandler } from '@flexiblepersistence/service';
import { Journaly, SenderReceiver } from 'journaly';

const journaly = Journaly.newJournaly() as SenderReceiver<any>;
const readDatabase = new PersistenceInfo(readInfo, journaly);
const eventDatabase = new PersistenceInfo(eventInfo, journaly);

const database = new MongoPersistence(readDatabase);

const read = new ServiceHandler(
  readDatabase,
  {
    test: new TestService(),
  },
  database
);
const write = new MongoPersistence(eventDatabase);
// console.log(journaly.getSubjects());
const handler = new Handler(write, read);
export default DatabaseHandler.getInstance({
  handler: handler,
  journaly: journaly,
}) as DatabaseHandler;

export { write, read };
