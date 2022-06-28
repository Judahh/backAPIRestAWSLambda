import TPromise from 'thread-promises';

const timer = (ms): TPromise<boolean> => {
  return new TPromise((resolve) =>
    setTimeout(() => {
      resolve(false);
    }, ms)
  );
};
export default timer;
