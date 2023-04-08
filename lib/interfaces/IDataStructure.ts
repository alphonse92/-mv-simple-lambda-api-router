import { IDataStructureIndexType } from '../types/DataStructures';

export interface IDataStructure<T> {
  get(index: IDataStructureIndexType): T | undefined;
  insert(index: IDataStructureIndexType, value: T): T;
  remove(index: IDataStructureIndexType): T;
  update(index: IDataStructureIndexType, value: T): { new: T; old: T };
}
