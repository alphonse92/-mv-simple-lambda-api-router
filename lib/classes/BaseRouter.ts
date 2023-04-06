import { NotImplementedYet, ServerError, isHttpError } from '../errors/http';
import { RouterController, RouterHandlerType, RouterMapType } from '../types/TRouter';

export enum EVENTS {
  ROUTE_PROCESSED = 'ROUTE_PROCESSED',
  ALL_ROUTES_PROCESSED = 'ALL_ROUTES_PROCESSED',
}
export type BaseRouterUseType<T> = RouterController<T>[] | RouterController<T>;
export type ControllerLookupResponseType<T> = Promise<RouterHandlerType<T | void>>;
export type EventListenerCallbackType<T> = (data: RouterMapType<T>, route?: RouterController<T>) => T | void;
export type EventListenerType<T> = (event: EVENTS, data: RouterMapType<T>, route?: RouterController<T>) => void;
export type HandlerByEventMapType<T> = { [event in EVENTS]?: EventListenerCallbackType<T> };

export default abstract class BaseRouter<T> {
  protected map: RouterMapType<T> = {};
  protected allRoutesLoaded = false;

  static separator = ':::';
  private __isExposed = false;
  private __totalOfRoutes = 0;
  private __routesProccesed = 0;
  private __eventListener: EventListenerType<T>;

  /**
   * defined method to lookup for a resource controller. MUST be implemented
   * @param receivedMethod
   * @param receivedPath
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected lookup(receivedMethod: string, receivedPath: string): ControllerLookupResponseType<T> {
    throw NotImplementedYet;
  }

  protected addEventListener(listenerHandler: EventListenerType<T>) {
    this.__eventListener = listenerHandler;
  }

  private emit(type: EVENTS, data: RouterMapType<T>, route: RouterController<T>) {
    if (typeof this.__eventListener === 'function') {
      this.__eventListener(type, data, route);
    }
  }

  private emitPartial(map: RouterMapType<T>, route: RouterController<T>) {
    if (this.__routesProccesed === this.__totalOfRoutes && this.__isExposed) {
      this.allRoutesLoaded = true;
      this.emit(EVENTS.ALL_ROUTES_PROCESSED, this.map, route);
      return;
    }

    this.emit(EVENTS.ROUTE_PROCESSED, map, route);
  }

  protected async lookupInCustomRouter(eventMapLookupController: HandlerByEventMapType<T>): Promise<T | void> {
    return new Promise((resolve, reject) => {
      // OVerriding custom event handlers callbacks to resolve/reject the promise
      const eventMapHandler: HandlerByEventMapType<T> = {
        [EVENTS.ALL_ROUTES_PROCESSED]: (data: RouterMapType<T>) => {
          // Router specific lookup function
          const customControllerLookup = eventMapLookupController[EVENTS.ALL_ROUTES_PROCESSED];
          // If exist then call it and resolve the promise
          const controller = customControllerLookup(data);
          if (customControllerLookup) resolve(controller);
          return controller;
        },
        [EVENTS.ROUTE_PROCESSED]: eventMapLookupController[EVENTS.ROUTE_PROCESSED],
      };

      // function that listen to changes in the router
      const eventHandler = (event: EVENTS, data: RouterMapType<T>, route: RouterController<T>) => {
        try {
          // take the proper handler from event
          const eventTypeHandler = eventMapHandler[event];
          // if it's configured the call it
          if (eventTypeHandler) eventTypeHandler(data, route);
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
      this.emitPartial(this.map, fullRoute);
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
