import { NotImplementedYet, ServerError, isHttpError } from '../errors/http';
import { RouterController, RouterHandlerType } from '../types/TRouter';
import RouterState, { ItemAndPathType } from './RouterState';

export enum EVENTS {
  ROUTE_PROCESSED = 'ROUTE_PROCESSED',
  ALL_ROUTES_PROCESSED = 'ALL_ROUTES_PROCESSED',
}
export type BaseRouterUseType<T> = RouterController<T>[] | RouterController<T>;
export type ControllerLookupResponseType<T> = Promise<RouterHandlerType<T | void>>;
export type EventListenerCallbackType<T> = (route?: RouterController<T>) => ItemAndPathType<T>;
export type EventListenerType<T> = (event: EVENTS, route?: RouterController<T>) => void;
export type HandlerByEventMapType<T> = { [event in EVENTS]?: EventListenerCallbackType<T> };

export default abstract class BaseRouter<T> extends RouterState<T> {
  static separator = ':::';

  // protected map: RouterMapType<T> = {};
  protected __allRoutesLoaded = false;
  private __isExposed = false;
  private __totalOfRoutes = 0;
  private __routesProccesed = 0;
  private __eventListener: EventListenerType<T>;

  constructor() {
    super();
  }

  protected addEventListener(listenerHandler: EventListenerType<T>) {
    this.__eventListener = listenerHandler;
  }

  private emit(type: EVENTS, route: RouterController<T>) {
    if (typeof this.__eventListener === 'function') {
      this.__eventListener(type, route);
    }
  }

  private emitPartial(route: RouterController<T>) {
    if (this.__routesProccesed === this.__totalOfRoutes && this.__isExposed) {
      this.__allRoutesLoaded = true;
      this.emit(EVENTS.ALL_ROUTES_PROCESSED, route);
      return;
    }

    this.emit(EVENTS.ROUTE_PROCESSED, route);
  }

  /**
   * Function that receives a method and path to find a controller that match with
   * @param method method as string
   * @param path url as string
   * @returns
   */
  protected lookup(method: string, path: string): Promise<ItemAndPathType<T>> {
    //  Handler that will be executed when all routers are loaded (processd)
    const allRoutesProcessedEventHandler = () => {
      const mapKey = this.getMapKey({ method, path });
      return this.getAndReturnPath(mapKey);
    };

    const eventMapHandler: HandlerByEventMapType<T> = {
      [EVENTS.ALL_ROUTES_PROCESSED]: allRoutesProcessedEventHandler,
      // [EVENTS.ROUTE_PROCESSED]: (data: RouterMapType<T>, route: RouterController<T>) => true,
    };

    return this.waitAndLookupController(eventMapHandler);
  }

  /**
   * This function will try to return the function handler for a given route.
   * Due it's async it receives a map that maps the BaseRouter events with the Router that extends this class.
   *
   * With that, this function returns a promise to let the custom router know when a path was loaded
   * @param eventMapLookupController Map of event controllers that will be triggered once an event occurs.
   * @returns
   */
  protected async waitAndLookupController(
    eventMapLookupController: HandlerByEventMapType<T>,
  ): Promise<ItemAndPathType<T>> {
    return new Promise((resolve, reject) => {
      // Overrides the custom event handlers callbacks to resolve/reject the promise
      const eventMapHandler: HandlerByEventMapType<T> = {
        [EVENTS.ALL_ROUTES_PROCESSED]: () => {
          // Router specific lookup function
          const customControllerLookup = eventMapLookupController[EVENTS.ALL_ROUTES_PROCESSED];
          // If exist then call it and resolve the promise

          if (customControllerLookup) {
            const controller = customControllerLookup();
            resolve(controller);
            return controller;
          }
        },
        [EVENTS.ROUTE_PROCESSED]: eventMapLookupController[EVENTS.ROUTE_PROCESSED],
      };

      // Function that add the function event listener that dispatch the promise.
      const listener = (event: EVENTS, route?: RouterController<T>) => {
        try {
          // take the proper handler from event
          const eventTypeHandler = eventMapHandler[event];
          // if it's configured the call it
          if (eventTypeHandler) eventTypeHandler(route);
        } catch (e) {
          reject(e);
        }
      };

      // If router is 100% loaded then get the event handler when the router has been finished
      if (this.__allRoutesLoaded) {
        const eventHandler = eventMapHandler[EVENTS.ALL_ROUTES_PROCESSED];
        if (eventHandler) eventHandler();
        return;
      }

      // subscribe
      this.addEventListener(listener);
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

      super.insert(mapKey, fullRoute.controller);
      this.__routesProccesed++;
      this.emitPartial(fullRoute);
    });
  }

  useAll(routes: BaseRouterUseType<T>, overrides: Partial<RouterController<T>> = {}) {
    const arrayOfRoutes = Array.isArray(routes) ? routes : [routes];
    this.__totalOfRoutes += arrayOfRoutes.length;
    arrayOfRoutes.map((route) => this.useController(route, overrides));
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
      if (routeOrRoutes) {
        this.useAll(routeOrRoutes, { path });
      }
    } else if (Array.isArray(args[0])) {
      this.useAll(args[0]);
    } else {
      this.useAll([args[0]]);
    }
  }

  delete(path: string): T {
    return super.remove(path);
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
