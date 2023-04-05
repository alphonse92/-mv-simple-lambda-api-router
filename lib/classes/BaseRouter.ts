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

  useAll(routes: RouterController<T>[]) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const This = this;
    return new Promise((resolve, reject) => {
      routes.map((route) => setTimeout(() => This.useController(route)));
      // setTimeout(() => routes.map(this.useController.bind(this)));
    });
  }

  /**
   * Overloaded method.
   *
   * If args is type of [string,RouterController<T>] add a single controller for that path. Usually you call it when using the util createController.
   * if args is type of [RouterController<T>[]] add a bulk of paths.
   * @param args All arguments.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use(...args: [string, BaseRouterUseType<T>] | [BaseRouterUseType<T> | any] | [BaseRouterUseType<T>[] | any]): void {
    if (typeof args[0] === 'string') {
      this.usePath(...(args as [string, BaseRouterUseType<T>]));
    } else if (Array.isArray(args[0])) {
      this.useAll(args[0]);
    } else {
      this.useAll([args[0]]);
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
