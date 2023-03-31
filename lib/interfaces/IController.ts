export interface IController<T> {
  getHandler(method: string): T;
}
