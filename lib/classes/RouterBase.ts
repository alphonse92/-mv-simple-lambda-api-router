import { NotImplementedControllerError, PathAlreadyExistError, ServerError, isHttpError } from '../errors/http';
import { RouterMapType } from '../types/TRouter';
import Controller from './Controller';

export default abstract class RouterBase<T, K> {
  protected map: RouterMapType<T, K> = {};

  use(path: string, controller: Controller<T>): void {
    if (this.map[path]) {
      throw PathAlreadyExistError;
    }
    this.map[path] = controller;
  }

  delete(awsPath: string): void {
    delete this.map[awsPath];
  }

  expose(): T {
    throw NotImplementedControllerError;
  }

  static errorToHttpError(e) {
    let error: any = ServerError;
    if (isHttpError(e)) {
      error = e;
    }

    const { statusCode, message } = error;

    return { statusCode, body: message };
  }
}
