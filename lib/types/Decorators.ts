import { RouterController } from './TRouter';

export type RouteFunctionType<T> = {
  getController: () => RouterController<T>;
};
