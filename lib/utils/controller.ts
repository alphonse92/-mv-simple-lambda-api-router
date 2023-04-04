import { RouterController } from '../types/TRouter';
import { IControllerConfig } from '../types/TController';

/**
 * Returns an array of RouteController<T> where T is a function that depends of the router handler
 * @param config IControllerConfig<T> config object
 * @returns An array of RouteController<T> where T is a function that depends of the router handler.
 */
export const createController = <T>(config: IControllerConfig<T>): RouterController<T>[] => {
  return Object.entries(config).map(([method, controller]) => ({ method, controller }));
};
