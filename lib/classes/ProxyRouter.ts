import { pathToRegexp } from 'path-to-regexp';
import { NotFoundError, NotImplementedControllerError } from '../errors/http';
import BaseRouter from './BaseRouter';
import { RouterHandlerType } from 'types/TRouter';

export default class ProxyRouter<T> extends BaseRouter<T> {
  lookupExactMatch(receivedMethod: string, receivedPath: string): RouterHandlerType<T> | undefined {
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

    return this.map[keyTrail] ?? this.map[keyNotTrail];
  }

  lookup(receivedMethod: string, receivedPath: string): RouterHandlerType<T> {
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
}
