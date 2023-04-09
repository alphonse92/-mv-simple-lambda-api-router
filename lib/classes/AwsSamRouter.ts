import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { NotFoundError } from '../errors/http';
import BaseRouter, { EVENTS } from './BaseRouter';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsSamRouter extends BaseRouter<HandlerType> {
  constructor() {
    super();
  }

  _lookup(receivedMethod: string, receivedPath: string) {
    const mapKey = this.getMapKey({ method: receivedMethod, path: receivedPath });
    return super.get(mapKey);
  }

  lookup(receivedMethod: string, receivedPath: string) {
    const eventMapHandler = {
      [EVENTS.ALL_ROUTES_PROCESSED]: () => this._lookup(receivedMethod, receivedPath),
    };

    return super.lookupInCustomRouter(eventMapHandler);
  }

  expose(): HandlerType {
    super.expose();
    return async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      try {
        const { resource, httpMethod } = event;

        const controller = await this.lookup(httpMethod, resource);
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
