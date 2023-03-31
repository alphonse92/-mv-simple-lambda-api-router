import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { pathToRegexp } from 'path-to-regexp';
import RouterBase from './RouterBase';
import { InvalidController, NotImplementedControllerError } from '../errors/http';
import { RouterHandlerType } from '../types/TRouter';
import { NotFoundError } from '../errors/http';
import Controller from './Controller';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsProxyRouter extends RouterBase<HandlerType, HandlerResultType> {
  lookup(receivedPath: string): RouterHandlerType<HandlerType, HandlerResultType> {
    if (!this.map) {
      throw NotImplementedControllerError;
    }
    const entries = Object.entries(this.map);
    const pathAndController = entries.find(([path]) => {
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

        const controller = this.lookup(path);
        if (controller instanceof Controller) {
          return controller.getHandler(httpMethod.toLowerCase())(event, context);
        }

        throw InvalidController;
      } catch (e: unknown) {
        return Promise.resolve(RouterBase.errorToHttpError(e));
      }
    };
  }
}
