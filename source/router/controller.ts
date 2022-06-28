import { DatabaseHandler } from 'backapi';
import { BaseControllerDefault } from 'backapirest';
import { RouterSingleton } from 'backapirest';
import stepIndex from './stepIndex';

const controller = async (
  routerSingleton: RouterSingleton,
  databaseHandler: DatabaseHandler,
  name: string
): Promise<BaseControllerDefault | undefined> => {
  return (await stepIndex(routerSingleton, databaseHandler))?.getController(
    name
  ) as BaseControllerDefault;
};

export default controller;
