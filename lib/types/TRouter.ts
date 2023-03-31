import { IController } from '../interfaces/IController';

export type RouterHandlerType<T, K> = IController<T> | T;
export type RouterMapType<T, K> = {
  [path: string]: RouterHandlerType<T, K>;
};
