import BaseRouter, { EVENTS, HandlerByEventMapType } from './BaseRouter';

export default class ProxyRouter<T> extends BaseRouter<T> {
  private _lookup(receivedMethod: string, receivedPath: string): T {
    const mapKey = super.getMapKey({ method: receivedMethod, path: receivedPath });
    return super.get(mapKey);
  }

  lookup(receivedMethod: string, receivedPath: string): Promise<T | void> {
    const eventMapHandler: HandlerByEventMapType<T> = {
      [EVENTS.ALL_ROUTES_PROCESSED]: () => this._lookup(receivedMethod, receivedPath),
      // [EVENTS.ROUTE_PROCESSED]: (data: RouterMapType<T>, route: RouterController<T>) => true,
    };

    return super.lookupInCustomRouter(eventMapHandler);
  }
}
