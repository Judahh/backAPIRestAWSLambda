type RouterCreator = {
  getInstance(): {
    // eslint-disable-next-line no-unused-vars
    createRoutes(...args: unknown[]): void;
  };
};

export default RouterCreator;
