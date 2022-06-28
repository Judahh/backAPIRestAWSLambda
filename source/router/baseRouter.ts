import { RouterSingleton } from 'backapirest';

export default (code: number, error: unknown): RouterSingleton =>
  ({
    getController: (name?: string) => {
      return {
        mainRequestHandler: (args) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          args[1].status(code).send({
            error,
            name,
          });
        },
      };
    },
  } as RouterSingleton);
