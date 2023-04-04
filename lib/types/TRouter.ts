export type RouterHandlerType<T> = T;
export type RouterMapType<T> = {
  [path: string]: RouterHandlerType<T>;
};
export type RouterController<T> = {
  path?: string;
  method: string;
  controller: T;
};
