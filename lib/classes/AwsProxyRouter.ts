import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { pathToRegexp } from 'path-to-regexp';
import BaseRouter from './BaseRouter';
import { NotImplementedControllerError } from '../errors/http';
import { RouterHandlerType } from '../types/TRouter';
import { NotFoundError } from '../errors/http';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsProxyRouter extends BaseRouter<HandlerType, HandlerResultType> {
  lookup(receivedMethod: string, receivedPath: string): RouterHandlerType<HandlerType, HandlerResultType> {
    if (!this.map) {
      throw NotImplementedControllerError;
    }
    const entries = Object.entries(this.map);
    const pathAndController = entries.find(([keyPath]) => {
      const [method, path] = keyPath.split(BaseRouter.separator);

      if (method.toLowerCase() !== receivedMethod.toLowerCase()) {
        return false;
      }

      const matcher = pathToRegexp(path);
      return matcher.test(receivedPath);
    });

    if (!pathAndController) {
      throw NotFoundError;
    }

    return pathAndController[1];
  }

  expose(): HandlerType {
    return (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      try {
        const { path, httpMethod } = event;

        const controller = this.lookup(httpMethod, path);

        if (typeof controller === 'function') {
          return controller(event, context);
        }

        throw NotFoundError;
      } catch (e: unknown) {
        return Promise.resolve(BaseRouter.errorToHttpError(e));
      }
    };
  }
}
