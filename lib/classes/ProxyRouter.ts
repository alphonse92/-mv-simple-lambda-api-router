import { pathToRegexp } from 'path-to-regexp';
import { NotFoundError, NotImplementedControllerError } from '../errors/http';
import BaseRouter, { EVENTS, HandlerByEventMapType } from './BaseRouter';
import { RouterController, RouterHandlerType, RouterMapType } from '../types/TRouter';

export default class ProxyRouter<T> extends BaseRouter<T> {
  private proxyRouterMap: RouterMapType<T>;

  private _lookupExactMatch(
    map: RouterMapType<T>,
    receivedMethod: string,
    receivedPath: string,
  ): RouterHandlerType<T> | undefined {
    const hasTrailingSlash = receivedPath.endsWith('/');

    let pathTrailing: string, pathNoTrailing: string;

    if (hasTrailingSlash) {
      pathTrailing = receivedPath;
      pathNoTrailing = receivedPath.slice(0, receivedPath.length - 1);
    } else {
      pathNoTrailing = receivedPath;
      pathTrailing = `${receivedPath}/`;
    }

    const keyTrail = this.getMapKey({ method: receivedMethod, path: pathTrailing });
    const keyNotTrail = this.getMapKey({ method: receivedMethod, path: pathNoTrailing });

    return map[keyTrail] ?? map[keyNotTrail];
  }

  private _lookup(map: RouterMapType<T>, receivedMethod: string, receivedPath: string): T {
    if (!map) {
      throw NotImplementedControllerError;
    }
    const exactController = this._lookupExactMatch(map, receivedMethod, receivedPath);

    if (exactController) {
      return exactController;
    }

    const entries = Object.entries(map) as [string, T][];
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

  lookup(receivedMethod: string, receivedPath: string): Promise<T | void> {
    const eventMapHandler: HandlerByEventMapType<T> = {
      [EVENTS.ALL_ROUTES_PROCESSED]: (data: RouterMapType<T>) => this._lookup(data, receivedMethod, receivedPath),
      [EVENTS.ROUTE_PROCESSED]: (data: RouterMapType<T>, route: RouterController<T>) =>
        console.log('procesing route:', route),
    };

    return super.lookupInCustomRouter(eventMapHandler);
  }
}
