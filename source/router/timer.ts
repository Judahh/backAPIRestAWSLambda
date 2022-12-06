import TPromise from 'thread-promises';

const timer = (ms): TPromise<unknown[], boolean, boolean> => {
  return new TPromise((resolve) =>
    setTimeout(() => {
      resolve(false);
    }, ms)
  );
};
export default timer;
