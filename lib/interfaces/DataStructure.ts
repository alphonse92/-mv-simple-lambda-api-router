export type DataStructureIndexType = number | string | symbol | undefined | null;
export interface DataStructure<T> {
  get(index: DataStructureIndexType): T;
  insert(index: DataStructureIndexType, value: T): T;
  remove(index: DataStructureIndexType): T;
  update(index: DataStructureIndexType, value: T): { new: T; old: T };
}
