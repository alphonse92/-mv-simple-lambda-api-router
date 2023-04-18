import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { NotFoundError } from '../errors/http';
import BaseRouter from './BaseRouter';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsSamRouter extends BaseRouter<HandlerType> {
  constructor() {
    super();
  }

  expose(): HandlerType {
    super.expose();
    return async (event: APIGatewayProxyEvent, context: Context, ...restArgs): Promise<APIGatewayProxyResult> => {
      try {
        const { resource, httpMethod } = event;

        const [controller] = await this.lookup(httpMethod, resource);
        if (typeof controller === 'function') {
          return controller(event, context, ...restArgs);
        }

        throw NotFoundError;
      } catch (e: unknown) {
        return Promise.resolve(BaseRouter.errorToHttpError(e));
      }
    };
  }
}
