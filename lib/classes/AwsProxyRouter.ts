import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { pathToRegexp } from 'path-to-regexp';
import BaseRouter from './BaseRouter';
import { NotImplementedControllerError } from '../errors/http';
import { RouterHandlerType } from '../types/TRouter';
import { NotFoundError } from '../errors/http';

export type controllerResultType = APIGatewayProxyResult;
export type HandlerResultType = Promise<controllerResultType>;
export type HandlerType = (event: APIGatewayProxyEvent, context: Context) => HandlerResultType;

export default class AwsProxyRouter extends BaseRouter<HandlerType> {
  lookupExactMatch(receivedMethod: string, receivedPath: string): RouterHandlerType<HandlerType> | undefined {
    const hasTrailingSlash = receivedPath.endsWith('/');

    let pathTrailing, pathNoTrailing;

    if (hasTrailingSlash) {
      pathTrailing = receivedPath;
      pathNoTrailing = receivedPath.slice(0, receivedPath.length - 1);
    } else {
      pathNoTrailing = receivedPath;
      pathTrailing = `${receivedPath}/`;
    }

    const keyTrail = this.getMapKey({ method: receivedMethod, path: pathTrailing });
    const keyNotTrail = this.getMapKey({ method: receivedMethod, path: pathNoTrailing });

    return this.map[keyTrail] ?? this.map[keyNotTrail];
  }
  lookup(receivedMethod: string, receivedPath: string): RouterHandlerType<HandlerType> {
    if (!this.map) {
      throw NotImplementedControllerError;
    }
    const exactController = this.lookupExactMatch(receivedMethod, receivedPath);

    if (exactController) {
      return exactController;
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
