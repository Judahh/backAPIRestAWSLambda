import { DatabaseHandler } from 'backapi';
import { RouterSingleton } from 'backapirest';
import {
  Context,
  APIGatewayProxyResult,
  Callback,
  APIGatewayEventDefaultAuthorizerContext,
  APIGatewayProxyEventBase,
} from 'aws-lambda';
import controller from './controller';

const request = async (
  args: [
    APIGatewayProxyEventBase<APIGatewayEventDefaultAuthorizerContext>,
    Context,
    Callback<APIGatewayProxyResult>
  ],
  routerSingleton: RouterSingleton,
  databaseHandler: DatabaseHandler,
  name: string
): Promise<Promise<Response> | undefined> => {
  const currentController = await controller(
    routerSingleton,
    databaseHandler,
    name
  );
  return currentController?.mainRequestHandler.bind(currentController)(args);
};

export default request;
