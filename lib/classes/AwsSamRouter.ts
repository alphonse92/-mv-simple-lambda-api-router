import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { NotFoundError } from '../errors/http';
import { RouterHandlerType } from '../types/TRouter';
import BaseRouter from './BaseRouter';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsSamRouter extends BaseRouter<HandlerType, HandlerResultType> {
  expose(): HandlerType {
    return (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      try {
        const { resource, httpMethod } = event;
        const mapKey = `${httpMethod.toLowerCase()}${BaseRouter.separator}${resource}`;
        const controller: RouterHandlerType<HandlerType, HandlerResultType> = this.map?.[mapKey];

        if (typeof controller === 'function') {
          return controller(event, context);
        }

        throw NotFoundError;
      } catch (e) {
        return Promise.resolve(BaseRouter.errorToHttpError(e));
      }
    };
  }
}
