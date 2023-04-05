import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { NotFoundError } from '../errors/http';
import { RouterHandlerType, RouterMapType } from '../types/TRouter';
import BaseRouter, { EVENTS } from './BaseRouter';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsSamRouter extends BaseRouter<HandlerType> {
  _lookup(map: RouterMapType<HandlerType>, receivedMethod: string, receivedPath: string) {
    const mapKey = this.getMapKey({ method: receivedMethod, path: receivedPath });
    const controller: RouterHandlerType<HandlerType> = map?.[mapKey];
    return controller;
  }

  async lookup(receivedMethod: string, receivedPath: string) {
    const eventMapHandler = {
      [EVENTS.ALL_ROUTES_PROCESSED]: (data: RouterMapType<HandlerType>) =>
        this._lookup(data, receivedMethod, receivedPath),
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
