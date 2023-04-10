import RouterState, { MethodSymbols, TreeRoot } from '../RouterState';

const PATHS_DEFS = {
  VERSION: {
    path: 'GET:::/',
    uri: 'GET:::/',
    handler: jest.fn(),
  },
  LIST_USERS: {
    path: 'GET:::/users/',
    uri: 'GET:::/users/',
    handler: jest.fn(),
  },
  GET_USER_PHOTO: {
    path: 'GET:::/users/photo-:foo(\\d+).png',
    uri: 'GET:::/users/photo-123.png',
    handler: jest.fn(),
  },
  GET_USER: {
    path: 'GET:::/users/:id',
    uri: 'GET:::/users/userid',
    handler: jest.fn(),
  },
  NEW_USER: {
    path: 'POST:::/users/',
    uri: 'POST:::/users/',
    handler: jest.fn(),
  },
  UPDATE_USER: {
    path: 'PUT:::/users/',
    uri: 'PUT:::/users/',
    handler: jest.fn(),
  },
  DELETE_USER: {
    path: 'DELETE:::/users/:id',
    uri: 'DELETE:::/users/userid',
    handler: jest.fn(),
  },
  LIST_CLIENTS: {
    path: 'GET:::/users/clients/',
    uri: 'GET:::/users/clients/',
    handler: jest.fn(),
  },
  GET_CLIENT: {
    path: 'GET:::/users/clients/:id',
    uri: 'GET:::/users/clients/clientid',
    handler: jest.fn(),
  },
  NEW_CLIENT: {
    path: 'POST:::/users/clients/',
    uri: 'POST:::/users/clients/',
    handler: jest.fn(),
  },
  GET_BILL: {
    path: 'GET:::/users/clients/:id/bills/:id',
    uri: 'GET:::/users/clients/clientid/bills/billid',
    handler: jest.fn(),
  },
  GET_BILLS: {
    path: 'GET:::/users/clients/:id/bills/:from/:to',
    uri: 'GET:::/users/clients/clientid/bills/2023-03-04/2023-04-04',
    handler: jest.fn(),
  },
};

const PATH_DEFS_ENTRIES = Object.entries(PATHS_DEFS);

const arrayOfUndefinedEndpoints = [
  'POST:::/',
  'GET:::/users/clients/clientid/bills',
  'GET:::/users/userid/bills',
  'GET:::/users/clients/clientid/bills/2023-03-04/2023-04-04/itDoesNotExist/',
  'GET:::/users/clients/clientid/bills/2023-03-04/2023-04-04/itDoesNotExist/itneither',
  'POST:::/users/clients/clientid/bills/2023-03-04/2023-04-04',
  'GET:::/login',
  'GET:::/login/signup',
  'GET:::/login/signit',
  'GET:::/users/employees/employeeid/hours',
  'POST:::/users/employees/employeeid/hours',
  'PUT:::/users/employees/employeeid/hours',
];

const mockedState = {
  '/': {
    [MethodSymbols.get]: PATHS_DEFS.VERSION.handler,
    users: {
      [MethodSymbols.get]: PATHS_DEFS.LIST_USERS.handler,
      [MethodSymbols.post]: PATHS_DEFS.NEW_USER.handler,
      [MethodSymbols.put]: PATHS_DEFS.UPDATE_USER.handler,
      'photo-:foo(\\d+).png': {
        [MethodSymbols.get]: PATHS_DEFS.GET_USER_PHOTO.handler,
      },
      ':id': {
        [MethodSymbols.get]: PATHS_DEFS.GET_USER.handler,
        [MethodSymbols.delete]: PATHS_DEFS.DELETE_USER.handler,
      },
      clients: {
        [MethodSymbols.post]: PATHS_DEFS.NEW_CLIENT.handler,
        [MethodSymbols.get]: PATHS_DEFS.LIST_CLIENTS.handler,
        ':id': {
          bills: {
            ':id': {
              [MethodSymbols.get]: PATHS_DEFS.GET_BILL.handler,
            },
            ':from': {
              ':to': {
                [MethodSymbols.get]: PATHS_DEFS.GET_BILLS.handler,
              },
            },
          },
          [MethodSymbols.get]: PATHS_DEFS.GET_CLIENT.handler,
        },
      },
    },
  },
};

type HandlerType = () => { body: string };

const initTest = () => {
  PATH_DEFS_ENTRIES.forEach(([name, { handler }]) => {
    handler.mockReturnValue({ body: name });
  });
};

const testUndefinedPaths = (router) =>
  arrayOfUndefinedEndpoints.forEach((path) => {
    it('Should not return handler for undefined path ' + path, () => {
      expect(router.get(path)).toEqual(undefined);
    });
  });

describe('list', () => {
  const router = new RouterState<HandlerType>(mockedState);

  beforeAll(initTest);

  PATH_DEFS_ENTRIES.forEach(([name, { path, handler }]) => {
    it('Should return handler for ' + path, () => {
      const returnedHandler = router.get(path);

      expect(returnedHandler).toBeDefined();
      expect(typeof returnedHandler).toEqual('function');
      expect(returnedHandler).toBe(handler);

      const result = handler();
      const { body } = result;
      expect(body).toEqual(name);
    });
  });

  testUndefinedPaths(router);
});

describe('insert', () => {
  const router = new RouterState<HandlerType>();

  beforeAll(initTest);

  PATH_DEFS_ENTRIES.forEach(([name, { path, handler, uri }]) => {
    it(`Should save the path ${path} and return the handler`, () => {
      handler.mockReturnValue({ body: name });
      const value = router.insert(path, handler);
      expect(value).toBe(handler);
    });
  });

  PATH_DEFS_ENTRIES.forEach(([name, { uri, path }]) => {
    it(`Should the uri ${uri}  get the handler for defined path: ${path}`, () => {
      const handler = router.get(uri);
      const result = handler();
      expect(result).toBeDefined();
      expect(result?.body).toEqual(name);
    });
  });

  testUndefinedPaths(router);

  it('Should the tree be equal to the expected tree root', () => {
    expect(JSON.stringify(router.getRoot())).toEqual(JSON.stringify(mockedState['/']));
  });
});
