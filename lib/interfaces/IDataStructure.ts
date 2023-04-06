export type IDataStructureIndexType = number | string | symbol | undefined | null;
export interface IDataStructure<T> {
  get(index: IDataStructureIndexType): T;
  insert(index: IDataStructureIndexType, value: T): T;
  remove(index: IDataStructureIndexType): T;
  update(index: IDataStructureIndexType, value: T): { new: T; old: T };
}
