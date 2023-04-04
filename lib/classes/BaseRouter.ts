import { NotImplementedControllerError, ServerError, isHttpError } from '../errors/http';
import { RouterController, RouterMapType } from '../types/TRouter';

export type BaseRouterUseType<T> = RouterController<T>[] | RouterController<T>;

export default abstract class BaseRouter<T> {
  protected map: RouterMapType<T> = {};
  static separator = ':::';

  getMapKey(route: Pick<RouterController<T>, 'path' | 'method'>, separator: string = BaseRouter.separator): string {
    return `${route.method.toLowerCase()}${separator}${route.path}`;
  }

  private updateConfig(config: BaseRouterUseType<T>, basePath?: string) {
    const arrayOfRoutes: RouterController<T>[] = Array.isArray(config) ? config : [config];

    arrayOfRoutes.forEach((route) => {
      const { controller } = route;
      const mapKey = this.getMapKey({ ...route, path: route.path ?? basePath });
      this.map[mapKey] = controller;
    });
  }

  private usePath(path: string, config: BaseRouterUseType<T>) {
    this.updateConfig(config, path);
  }

  private useController(config: BaseRouterUseType<T>) {
    this.updateConfig(config);
  }

  /**
   * Overloaded method.
   *
   * It could be called with one parameter a BaseRouterUseType or array of BaseRouterUseType. Path should be specified in the object.
   * It could be called with two parameters: path, and BaseRouterUseType;
   *
   * I keeps this just for backward compatibility.
   *
   * @param args All arguments.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use(...args: [string, BaseRouterUseType<T>] | [BaseRouterUseType<T> | any]): void {
    if (typeof args[0] === 'string') {
      this.usePath(...(args as [string, BaseRouterUseType<T>]));
    } else {
      this.useController(...(args as [BaseRouterUseType<T>]));
    }
  }

  delete(awsPath: string): void {
    delete this.map[awsPath];
  }

  expose(): T {
    throw NotImplementedControllerError;
  }

  static errorToHttpError(e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let error: any = ServerError;
    if (isHttpError(e)) {
      error = e;
    }

    const { statusCode, message } = error;

    return { statusCode, body: message };
  }
}
