import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { match } from 'path-to-regexp';
import BaseRouter from './BaseRouter';
import { NotFoundError } from '../errors/http';
import ProxyRouter from './ProxyRouter';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsProxyRouter extends ProxyRouter<HandlerType> {
  expose(): HandlerType {
    super.expose();
    return async (event: APIGatewayProxyEvent, context: Context, ...args): Promise<APIGatewayProxyResult> => {
      try {
        const { path, httpMethod, pathParameters } = event;

        const [controller, pathToController] = await this.lookup(httpMethod, path);
        if (typeof controller === 'function') {
          const matcher = match(pathToController, { decode: decodeURIComponent });
          const matchResult = matcher(path);

          if (matchResult !== false) {
            const routerPathParameters = { ...matchResult.params };
            const highOrderParameters = { ...pathParameters, ...routerPathParameters };
            event.pathParameters = highOrderParameters;
          }
          return controller(event, context, ...args);
        }

        throw NotFoundError;
      } catch (e: unknown) {
        return Promise.resolve(BaseRouter.errorToHttpError(e));
      }
    };
  }
}
