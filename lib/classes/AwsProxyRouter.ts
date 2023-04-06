import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import BaseRouter from './BaseRouter';
import { NotFoundError } from '../errors/http';
import ProxyRouter from './ProxyRouter';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsProxyRouter extends ProxyRouter<HandlerType> {
  expose(): HandlerType {
    super.expose();
    return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      try {
        const { path, httpMethod } = event;

        const controller = await this.lookup(httpMethod, path);
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
