export type RouterHandlerType<T, K> = T;
export type RouterMapType<T, K> = {
  [path: string]: RouterHandlerType<T, K>;
};
export type RouterController<T> = {
  path?: string;
  method: string;
  controller: T;
};
