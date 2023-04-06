import { DataStructure, DataStructureIndexType } from '../interfaces/DataStructure';
import { RouterController } from '../types/TRouter';

export type TreeRoutePath<T> = {
  route?: RouterController<T>;
  childrenPaths?: TreeRoutePath<T>;
};
export default class RouterTree<T> implements DataStructure<T> {
  get(index: DataStructureIndexType): T {
    throw new Error('Method not implemented.');
  }
  insert(index: DataStructureIndexType, value: T): T {
    throw new Error('Method not implemented.');
  }
  remove(index: DataStructureIndexType): T {
    throw new Error('Method not implemented.');
  }
  update(index: DataStructureIndexType): { new: T; old: T } {
    throw new Error('Method not implemented.');
  }
}
