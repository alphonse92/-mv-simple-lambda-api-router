import { pathToRegexp } from 'path-to-regexp';
import { IDataStructureRequiredIndexType } from 'types/DataStructures';
import { IDataStructure } from '../interfaces/IDataStructure';

export const RouterRootBase = '/';

export enum METHODS {
  connect = 'connect',
  delete = 'delete',
  get = 'get',
  head = 'head',
  options = 'options',
  post = 'post',
  put = 'put',
  patch = 'patch',
  trace = 'trace',
}

export const MethodSymbols = {
  [METHODS.connect]: Symbol('connect'),
  [METHODS.delete]: Symbol('delete'),
  [METHODS.get]: Symbol('get'),
  [METHODS.head]: Symbol('head'),
  [METHODS.options]: Symbol('options'),
  [METHODS.post]: Symbol('post'),
  [METHODS.put]: Symbol('put'),
  [METHODS.patch]: Symbol('patch'),
  [METHODS.trace]: Symbol('trace'),
};

export type TreeNodeMethods<T> = {
  [method in METHODS]?: T;
};

export type ControllerMethods<T> = TreeNodeMethods<T>;

export type TreeRoot<T> = {
  [path: string]: TreeRoot<T>;
} & TreeNodeMethods<T>;

export type IteratorEvent<T> = {
  onEnd: (method: string, tokens: string[], tree: TreeRoot<T>) => TreeRoot<T>;
  onNotFound: (method: string, currentToken: string, tree: TreeRoot<T>) => undefined;
};

export type RouterRoot<T> = {
  [RouterRootBase]: TreeRoot<T>;
};

const stateDefaultRoot = {
  [RouterRootBase]: {},
};

export default class RouterTree<T> implements IDataStructure<T> {
  static SEPARATOR = ':::';
  private state: RouterRoot<T>;

  constructor(initialState: RouterRoot<T> = stateDefaultRoot) {
    this.state = initialState;
  }

  getRoot(): TreeRoot<T> {
    return this.state[RouterRootBase];
  }

  getSymbolMethod(method: string) {
    const symbol = MethodSymbols[method.toLowerCase()];
    return symbol;
  }

  matchExact(token: string, tree: TreeRoot<T>): TreeRoot<T> | undefined {
    // methods uses symbols to get the keys in the tree store
    // So we'll be safe if we receive a token with "get" or "post"
    const partialTree = tree[token];
    return partialTree;
  }

  /**
   * It wil try to match with a regular expresion.
   * Before using it first try to matchExact function
   * @param token
   * @param tree
   * @returns
   */
  matchWith(token: string, tree: TreeRoot<T>): TreeRoot<T> | undefined {
    const result = Object.entries(tree).find(([path]) => {
      const regexp = pathToRegexp(path);
      const result = regexp.exec(token);
      return Boolean(result?.length);
    });

    if (!result) return;

    const [path, partialTree] = result;

    return partialTree as TreeRoot<T>;
  }

  match(token: string, tree: TreeRoot<T>): TreeRoot<T> | undefined {
    const result = this.matchExact(token, tree) ?? this.matchWith(token, tree) ?? undefined;

    return result;
  }

  iterate(method: METHODS, tokens: string[], tree: TreeRoot<T>, events: IteratorEvent<T>): TreeRoot<T> | undefined {
    const end = !Boolean(tokens.length);

    // No more way to go, then return the tree.
    if (end) {
      return events.onEnd(method, tokens, tree);
    }

    // Otherwise get the first token
    const [currentToken, ...restOfTokens] = tokens;

    // try to get the tree for a given token in the current state tree
    const partialTree: TreeRoot<T> | undefined = this.match(currentToken, tree);

    // Tree not found, means path does not exist
    if (!partialTree) {
      return events.onNotFound(method, currentToken, tree);
    }

    // Keep looping
    return this.iterate(method, restOfTokens ?? [], partialTree, events);
  }

  search(method: METHODS, tokens: string[], tree: TreeRoot<T>): TreeRoot<T> | undefined {
    return this.iterate(method, tokens, tree, {
      onEnd: (method: METHODS, tokens: string[], tree: TreeRoot<T>): TreeRoot<T> => tree,
      onNotFound: (method: METHODS, currentToken: string, tree: TreeRoot<T>): undefined => undefined,
    });
  }

  /**
   * Given an index return the value of that node
   * @param index IDataStructureIndexType
   * @returns T
   */
  get(index: string): T | undefined {
    const [method, fullPath] = index.split(RouterTree.SEPARATOR);
    const tokens = fullPath.split('/').filter(Boolean);
    const partialTree = this.search(method as METHODS, tokens, this.getRoot()) as TreeNodeMethods<T>;
    const symbol = this.getSymbolMethod(method);
    const handler = partialTree[symbol];
    return handler;
  }

  /**
   * Insert an element T at the given index
   * @param index IDataStructureIndexType index where the value will be stored
   * @param value
   */
  insert(index: IDataStructureRequiredIndexType, value: T): T {
    throw new Error('Method not implemented.');
  }
  remove(index: IDataStructureRequiredIndexType): T {
    throw new Error('Method not implemented.');
  }
  update(index: IDataStructureRequiredIndexType): { new: T; old: T } {
    throw new Error('Method not implemented.');
  }
}
