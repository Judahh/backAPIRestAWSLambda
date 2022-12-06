import TPromise from 'thread-promises';
import { RouterSingleton } from 'backapirest';

const createRoutes = (
  router: RouterSingleton,
  ...args: unknown[]
): TPromise<unknown[], boolean, boolean> => {
  return new TPromise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    router.getInstance().createRoutes(...args);
    resolve(true);
  });
};
export default createRoutes;
