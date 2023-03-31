import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { InvalidController, NotImplementedControllerError } from '../errors/http';
import { RouterHandlerType } from '../types/TRouter';
import Controller from './Controller';
import RouterBase from './RouterBase';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsSamRouter extends RouterBase<HandlerType, HandlerResultType> {
  expose(): HandlerType {
    return (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      const { resource, httpMethod } = event;
      const controller: RouterHandlerType<HandlerType, HandlerResultType> = this.map?.[resource];

      if (!controller) {
        throw NotImplementedControllerError;
      }
      if (controller instanceof Controller) {
        return controller.getHandler(httpMethod.toLowerCase())(event, context);
      }
      if (typeof controller === 'function') {
        return controller(event, context);
      }

      throw InvalidController;
    };
  }
}
