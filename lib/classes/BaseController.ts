import { NotImplementedHandler } from '../errors/http';
import { IController } from '../interfaces/IController';
import { IControllerConfig } from '../types/TController';

export default abstract class BaseController<T> implements IController<T> {
  constructor(private config: IControllerConfig<T>) {}

  getHandler(method: string): T {
    const methodHandler = this.config[method.toLowerCase()];

    if (!methodHandler) {
      throw NotImplementedHandler;
    }

    return methodHandler;
  }
}
