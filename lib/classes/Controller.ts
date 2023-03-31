import { IControllerConfig } from '../types/TController';
import BaseController from './BaseController';

export default class Controller<T> extends BaseController<T> {
  constructor(config: IControllerConfig<T>) {
    super(config);
  }
}
