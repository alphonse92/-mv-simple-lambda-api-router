import { NotImplementedHandler, NotImplementedYet, ServerError, isHttpError } from '../errors/http';
import { RouterController, RouterHandlerType, RouterMapType } from '../types/TRouter';

export type BaseRouterUseType<T> = RouterController<T>[] | RouterController<T>;
export enum EVENTS {
  ROUTE_PROCESSED,
  ALL_ROUTES_PROCESSED,
}
export default abstract class BaseRouter<T> {
  protected map: RouterMapType<T> = {};
  protected allRoutesLoaded = false;

  static separator = ':::';
  private __isExposed = false;
  private __totalOfRoutes = 0;
  private __routesProccesed = 0;
  private __eventListener;

  /**
   * defined method to lookup for a resource controller. MUST be implemented
   * @param receivedMethod
   * @param receivedPath
   */
  protected async lookup(receivedMethod: string, receivedPath: string): Promise<RouterHandlerType<T>> {
    throw NotImplementedYet;
  }

  protected addEventListener(listenerHandler) {
    this.__eventListener = listenerHandler;
  }

  private emit(type: EVENTS, data: RouterMapType<T>) {
    if (typeof this.__eventListener === 'function') {
      this.__eventListener(type, data);
    }
  }

  private emitPartial(map: RouterMapType<T>) {
    if (this.__routesProccesed === this.__totalOfRoutes && this.__isExposed) {
      this.allRoutesLoaded = true;
      this.emit(EVENTS.ALL_ROUTES_PROCESSED, this.map);
      return;
    }

    this.emit(EVENTS.ROUTE_PROCESSED, map);
  }

  protected async lookupInCustomRouter(eventMapLookupController): Promise<RouterHandlerType<T>> {
    return new Promise((resolve, reject) => {
      // map of event handler
      const eventMapHandler = {
        [EVENTS.ALL_ROUTES_PROCESSED]: (data: RouterMapType<T>) => {
          const customControllerLookup = eventMapLookupController[EVENTS.ALL_ROUTES_PROCESSED];
          if (customControllerLookup) resolve(customControllerLookup(data));
        },
      };

      // function that listen to changes in the router
      const eventHandler = (event: EVENTS, data: RouterMapType<T>) => {
        try {
          // take the proper handler from event
          const eventTypeHandler = eventMapHandler[event];
          // if it's configured the call it
          if (eventTypeHandler) eventTypeHandler(data);
        } catch (e) {
          reject(e);
        }
      };

      // If router is 100% loaded then get the event handler when the router has been finished
      if (this.allRoutesLoaded) {
        const eventHandler = eventMapHandler[EVENTS.ALL_ROUTES_PROCESSED];
        eventHandler(this.map);
        return;
      }

      // subscribe
      this.addEventListener(eventHandler);
    });
  }

  protected getMapKey(
    route: Pick<RouterController<T>, 'path' | 'method'>,
    separator: string = BaseRouter.separator,
  ): string {
    return `${route.method.toLowerCase()}${separator}${route.path}`;
  }

  private useController(route: RouterController<T>, overrides: Partial<RouterController<T>> = {}) {
    setTimeout(() => {
      const fullRoute = { ...route, ...overrides };
      const mapKey = this.getMapKey({ ...fullRoute });
      this.map[mapKey] = fullRoute.controller;
      this.__routesProccesed++;
      this.emitPartial(this.map);
    });
  }

  useAll(routes: RouterController<T>[], overrides: Partial<RouterController<T>> = {}) {
    this.__totalOfRoutes += routes.length;
    routes.map((route) => this.useController(route, overrides));
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
      const [path, routeOrRoutes] = args;
      const arrayOfRoutes = Array.isArray(routeOrRoutes) ? routeOrRoutes : [routeOrRoutes];
      this.useAll(arrayOfRoutes, { path });
    } else if (Array.isArray(args[0])) {
      this.useAll(args[0]);
    } else {
      this.useAll([args[0]]);
    }
  }

  delete(awsPath: string): void {
    delete this.map[awsPath];
  }

  expose(): void {
    this.__isExposed = true;
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
