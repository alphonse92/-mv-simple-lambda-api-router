import { IDataStructure, IDataStructureIndexType } from '../interfaces/IDataStructure';
import { RouterController } from '../types/TRouter';

export type TreeRoutePath<T> = {
  route?: RouterController<T>;
  childrenPaths?: TreeRoutePath<T>;
};
export default class RouterTree<T> implements IDataStructure<T> {
  get(index: IDataStructureIndexType): T {
    throw new Error('Method not implemented.');
  }
  insert(index: IDataStructureIndexType, value: T): T {
    throw new Error('Method not implemented.');
  }
  remove(index: IDataStructureIndexType): T {
    throw new Error('Method not implemented.');
  }
  update(index: IDataStructureIndexType): { new: T; old: T } {
    throw new Error('Method not implemented.');
  }
}
