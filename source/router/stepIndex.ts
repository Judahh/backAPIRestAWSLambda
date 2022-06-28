import { DatabaseHandler } from 'backapi';
import { RouterSingleton, InitError, HttpError } from 'backapirest';
import createRoutes from './createRoutes';
import timer from './timer';
import baseRouter from './baseRouter';

console.log('Initializing Routes...');
let dBHandler;
let done = false;
const useStep = process.env.USE_STEP
  ? process.env.USE_STEP.toLowerCase() === 'true' ||
    process.env.USE_STEP === '1'
  : false;

const stepIndex = async (
  routerSingleton: RouterSingleton,
  databaseHandler: DatabaseHandler
): Promise<RouterSingleton> => {
  try {
    if (dBHandler === undefined) {
      dBHandler = databaseHandler;
      if (useStep) throw new InitError();
    }
    if (useStep) {
      if (!done) {
        const stepSize = process.env.STEP_SIZE ? +process.env.STEP_SIZE : 1000;
        await Promise.race([
          timer(stepSize),
          createRoutes(
            routerSingleton,
            dBHandler.getInit(),
            dBHandler.getMauth ? dBHandler.getMauth() : undefined
          ),
        ]);
        done = true;
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return routerSingleton.getInstance();
      }
      throw new InitError();
    } else {
      if (!done) {
        createRoutes(
          routerSingleton,
          dBHandler.getInit(),
          dBHandler.getMauth ? dBHandler.getMauth() : undefined
        );
        done = true;
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return routerSingleton.getInstance();
    }
  } catch (error) {
    console.error('Error:', error);
    return baseRouter(
      (error as HttpError).code || 500,
      (error as HttpError).message || error
    );
  }
};

export default stepIndex;
