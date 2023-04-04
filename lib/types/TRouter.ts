import { BaseController } from 'classes';

export type RouterHandlerType<T, K> = BaseController<T> | T;
export type RouterMapType<T, K> = {
  [path: string]: RouterHandlerType<T, K>;
};
export type RouterController<T> = {
  path: string;
  method: string;
  controller: T;
};
