import Controller from '../classes/Controller';
import { IControllerConfig } from '../types/TController';

export const createController = <T>(config: IControllerConfig<T>) => {
  const controller = new Controller<T>(config);
  return controller;
};
