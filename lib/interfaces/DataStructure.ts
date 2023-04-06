type indexType = number | string | symbol;
export interface DataStructure<T> {
  insert(index: indexType, value: T): T;
  remove(index: indexType): T;
  update(index: indexType, value: T): { new: T; old: T };
}
