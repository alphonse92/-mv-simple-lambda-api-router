import { DataStructure } from '../interfaces/DataStructure';
import { RouterController } from '../types/TRouter';

export type TreeRoutePath<T> = {
  route?: RouterController<T>;
  childrenPaths?: TreeRoutePath<T>;
};
export default class RouterTree<T> implements DataStructure<T> {
  insert(index: string | number | symbol, value: T): T {
    throw new Error('Method not implemented.');
  }
  remove(index: string | number | symbol): T {
    throw new Error('Method not implemented.');
  }
  update(index: string | number | symbol, value: T): { new: T; old: T; } {
    throw new Error('Method not implemented.');
  }
}
