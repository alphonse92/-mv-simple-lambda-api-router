import { pathToRegexp } from 'path-to-regexp';
import { IDataStructureRequiredIndexType } from '../types/DataStructures';
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

export enum IteratorResultTypes {
  END = 'END',
  NOT_FOUND = 'NOT_FOUND',
}
export type IteratorResultType<T> = {
  status: IteratorResultTypes;
  tree?: TreeRoot<T>;
  tokens?: string[];
  currentToken?: string;
};
export type MatchSingleResultType<T> = { path: string; tree?: TreeRoot<T>; matchWith: string };
export type MatchMultipleResults<T> = MatchSingleResultType<T>[];
export type MatchResult<T> = MatchMultipleResults<T> | MatchSingleResultType<T> | undefined;
export type RouterRoot<T> = {
  [RouterRootBase]: TreeRoot<T>;
};

export default class RouterState<T> implements IDataStructure<T> {
  static SEPARATOR = ':::';
  private state: RouterRoot<T>;
  private __last_path_visited__ = '';

  constructor(initialState: RouterRoot<T> = { [RouterRootBase]: {} }) {
    this.state = initialState;
  }

  getRoot(): TreeRoot<T> {
    return this.state[RouterRootBase];
  }

  getSymbolMethod(method: string) {
    const symbol = MethodSymbols[method.toLowerCase()];
    return symbol;
  }

  matchExact(token: string, tree: TreeRoot<T>): MatchSingleResultType<T> {
    // methods uses symbols to get the keys in the tree store
    // So we'll be safe if we receive a token with "get" or "post"
    const partialTree = tree[token];
    return { path: token, tree: partialTree as TreeRoot<T>, matchWith: token };
  }

  /**
   * It wil try to match with a regular expresion.
   * Before using it first try to matchExact function
   * @param token
   * @param tree
   * @returns
   */
  matchWith(token: string, tree: TreeRoot<T>): MatchMultipleResults<T> {
    return Object.entries(tree).reduce((acc, [path, leef]) => {
      const regexp = pathToRegexp(path);
      const result = regexp.exec(token);
      if (result?.length) return [...acc, { path, tree: leef as TreeRoot<T>, matchWith: path }];
      return [...acc];
    }, [] as unknown as MatchMultipleResults<T>);
  }

  match(token: string, tree: TreeRoot<T>): MatchMultipleResults<T> {
    const result: MatchResult<T> = this.matchExact(token, tree);

    if (result?.tree) return [result];

    return this.matchWith(token, tree);
  }

  iterate(tokens: string[], tree: TreeRoot<T>, currentPath: string): [IteratorResultType<T>, string?] {
    const end = !Boolean(tokens.length);

    // Tokens is empty and there is not way to keep looping.
    // That means we found the path
    if (end) {
      // return the path
      return [{ status: IteratorResultTypes.END, tree, tokens }, currentPath];
    }

    // Otherwise get the first token
    const [currentToken, ...restOfTokens] = tokens;

    // try to get the tree for a given token in the current state tree
    const matchResults: MatchMultipleResults<T> = this.match(currentToken, tree);

    // Formalize to an array of results
    const arrayOfMatches: MatchMultipleResults<T> = Array.isArray(matchResults) ? matchResults : [matchResults];

    // A path may match with parameter paths. In any case it will be an array of matches. Then loop in-order
    for (let i = 0; i < arrayOfMatches.length; i++) {
      const { tree: leef, matchWith } = arrayOfMatches[i];

      // Iterates in order
      if (leef) {
        const [value, path] = this.iterate(restOfTokens ?? [], leef, `${currentPath}/${matchWith}`);

        // If it reaches the end, then return the value and stop.

        if (value?.status === IteratorResultTypes.END) {
          return [value, path];
        }
      }
    }

    // default case: path was not found and return the last seen leef
    return [{ status: IteratorResultTypes.NOT_FOUND, tree }];
  }

  search(tokens: string[], tree: TreeRoot<T>): TreeRoot<T> | undefined {
    const [result, path] = this.iterate(tokens, tree, '');

    if (result?.status === IteratorResultTypes.END) {
      this.__last_path_visited__ = path;
      return result.tree;
    }

    this.__last_path_visited__ = '';
  }

  /**
   * Given an index return the value of that node
   * @param index IDataStructureIndexType
   * @returns T
   */
  get(index: string): T | undefined {
    const [method, fullPath] = index.split(RouterState.SEPARATOR);
    const tokens = fullPath.split('/').filter(Boolean);
    const partialTree = this.search(tokens, this.getRoot());

    if (!partialTree) return;

    const symbol = this.getSymbolMethod(method);
    const handler = partialTree[symbol] as T;
    return handler;
  }

  /**
   * This function does the same that get, butit also returns the path of the item in the tree. Useful to get
   * the proxy path it matches with. Note the path does not contain the trailing slash
   * @param index
   * @returns [T,string] where T is the handler, and the string is the path that points to handler in the treee
   */
  getAndReturnPath(index: string): [T, string | undefined] {
    const item = this.get(index);
    const pathToItem = this.__last_path_visited__?.length ? this.__last_path_visited__ : undefined;

    return [item, item ? pathToItem : undefined];
  }

  /**
   * Insert an element T at the given index
   * @param index IDataStructureIndexType index where the value will be stored
   * @param value
   */
  insert(index: string, value: T): T {
    const [method, fullPath] = index.split(RouterState.SEPARATOR);
    const tokens = fullPath.split('/').filter(Boolean);

    let iToken = 0;
    let partialTree: TreeRoot<T> = this.getRoot();

    while (iToken < tokens.length) {
      const token = tokens[iToken];
      // default value
      const currentTokenTree: TreeRoot<T> = (partialTree[token] as TreeRoot<T>) ?? {};
      // initialize or set the current
      partialTree[token] = currentTokenTree;
      // Move the tree pointer
      partialTree = currentTokenTree;
      // move the index
      iToken++;
    }

    // once we are at the leef, then add the method.
    (partialTree as TreeNodeMethods<T>)[MethodSymbols[method.toLowerCase()]] = value;

    return value;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  remove(index: IDataStructureRequiredIndexType): T {
    throw new Error('Method not implemented.');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(index: IDataStructureRequiredIndexType): { new: T; old: T } {
    throw new Error('Method not implemented.');
  }
}
