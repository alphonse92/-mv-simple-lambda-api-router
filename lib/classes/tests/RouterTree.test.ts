import RouterTree, { MethodSymbols, TreeRoot } from '../RouterTree';

/**
 * This state defines the following paths:
 *
 * Users:
 *
 * 1. GET/ app version
 * 2. GET/users list of users
 * 3. GET/users/:id return a user given an id
 * 4. POST/users creates a new user
 * 5. DELETE/users/:id delete a given
 *
 * Clients:
 * 1. GET/users/clients/ get a list of users
 * 2. GET/users/clients/:id get a user given an id
 * 3. POS/usersT/clients create a new client
 * 4. GET/users/clients/:id/bills/:from/:to get a list of bills between two dates: from and to
 *
 * For a given path:
 *
 * GET /users/clients/1/bills/2023-03-07/2023-04-07
 *
 * Notes:
 *
 * /users/clients  matchs with /users/:id
 * but it should not return the controler for /users/:id
 *
 * Should return 'bills from to'
 *
 *
 * Flow:
 *
 * The first step is try to matching exactly. If so, returns the controller
 */

const BODY_MOCKS = {
  VERSION: 'version app',
  LIST_USERS: 'list of users',
  GET_USER: 'user entity',
  GET_USER_PHOTO: 'user photo',
  NEW_USER: 'new user',
  UPDATE_USER: 'user updated',
  DELETE_USER: 'user deleted',
  LIST_CLIENTS: 'list of clients',
  GET_CLIENT: 'client entity',
  NEW_CLIENT: 'new client',
  GET_BILL: 'get bill',
  GET_BILLS: 'bills from to',
};

const ACTIONS = {
  VERSION: jest.fn().mockReturnValue({ body: BODY_MOCKS.VERSION }),
  LIST_USERS: jest.fn().mockReturnValue({ body: BODY_MOCKS.LIST_USERS }),
  GET_USER: jest.fn().mockReturnValue({ body: BODY_MOCKS.GET_USER }),
  GET_USER_PHOTO: jest.fn().mockReturnValue({ body: BODY_MOCKS.GET_USER_PHOTO }),
  NEW_USER: jest.fn().mockReturnValue({ body: BODY_MOCKS.NEW_USER }),
  UPDATE_USER: jest.fn().mockReturnValue({ body: BODY_MOCKS.UPDATE_USER }),
  DELETE_USER: jest.fn().mockReturnValue({ body: BODY_MOCKS.DELETE_USER }),
  LIST_CLIENTS: jest.fn().mockReturnValue({ body: BODY_MOCKS.LIST_CLIENTS }),
  GET_CLIENT: jest.fn().mockReturnValue({ body: BODY_MOCKS.GET_CLIENT }),
  NEW_CLIENT: jest.fn().mockReturnValue({ body: BODY_MOCKS.NEW_CLIENT }),
  GET_BILL: jest.fn().mockReturnValue({ body: BODY_MOCKS.GET_BILL }),
  GET_BILLS: jest.fn().mockReturnValue({ body: BODY_MOCKS.GET_BILLS }),
};

const PATHS = {
  VERSION: 'GET:::/',
  LIST_USERS: 'GET:::/users/',
  GET_USER: 'GET:::/users/userid',
  GET_USER_PHOTO: 'GET:::/users/photo-123.png',
  NEW_USER: 'POST:::/users/',
  UPDATE_USER: 'PUT:::/users/',
  DELETE_USER: 'DELETE:::/users/userid',
  LIST_CLIENTS: 'GET:::/users/clients/',
  GET_CLIENT: 'GET:::/users/clients/clientid',
  NEW_CLIENT: 'POST:::/users/clients/',
  GET_BILL: 'GET:::/users/clients/clientid/bills/billid',
  GET_BILLS: 'GET:::/users/clients/clientid/bills/2023-03-04/2023-04-04',
};

const PATH_AND_ACTIONS = {
  [PATHS.VERSION]: { expectedResponseBody: BODY_MOCKS.VERSION, handler: ACTIONS.VERSION },
  [PATHS.LIST_USERS]: { expectedResponseBody: BODY_MOCKS.LIST_USERS, handler: ACTIONS.LIST_USERS },
  [PATHS.GET_USER]: { expectedResponseBody: BODY_MOCKS.GET_USER, handler: ACTIONS.GET_USER },
  [PATHS.GET_USER_PHOTO]: { expectedResponseBody: BODY_MOCKS.GET_USER_PHOTO, handler: ACTIONS.GET_USER_PHOTO },
  [PATHS.NEW_USER]: { expectedResponseBody: BODY_MOCKS.NEW_USER, handler: ACTIONS.NEW_USER },
  [PATHS.UPDATE_USER]: { expectedResponseBody: BODY_MOCKS.UPDATE_USER, handler: ACTIONS.UPDATE_USER },
  [PATHS.DELETE_USER]: { expectedResponseBody: BODY_MOCKS.DELETE_USER, handler: ACTIONS.DELETE_USER },
  [PATHS.LIST_CLIENTS]: { expectedResponseBody: BODY_MOCKS.LIST_CLIENTS, handler: ACTIONS.LIST_CLIENTS },
  [PATHS.GET_CLIENT]: { expectedResponseBody: BODY_MOCKS.GET_CLIENT, handler: ACTIONS.GET_CLIENT },
  [PATHS.NEW_CLIENT]: { expectedResponseBody: BODY_MOCKS.NEW_CLIENT, handler: ACTIONS.NEW_CLIENT },
  [PATHS.GET_BILL]: { expectedResponseBody: BODY_MOCKS.GET_BILL, handler: ACTIONS.GET_BILL },
  [PATHS.GET_BILLS]: { expectedResponseBody: BODY_MOCKS.GET_BILLS, handler: ACTIONS.GET_BILLS },
};

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

const state = {
  '/': {
    [MethodSymbols.get]: ACTIONS.VERSION,
    users: {
      [MethodSymbols.get]: ACTIONS.LIST_USERS,
      [MethodSymbols.post]: ACTIONS.NEW_USER,
      [MethodSymbols.put]: ACTIONS.UPDATE_USER,
      'photo-:foo(\\d+).png': {
        [MethodSymbols.get]: ACTIONS.GET_USER_PHOTO,
      },
      ':id': {
        [MethodSymbols.get]: ACTIONS.GET_USER,
        [MethodSymbols.delete]: ACTIONS.DELETE_USER,
      },
      clients: {
        [MethodSymbols.post]: ACTIONS.NEW_CLIENT,
        [MethodSymbols.get]: ACTIONS.LIST_CLIENTS,
        ':id': {
          bills: {
            ':id': {
              [MethodSymbols.get]: ACTIONS.GET_BILL,
            },
            ':from': {
              ':to': {
                [MethodSymbols.get]: ACTIONS.GET_BILLS,
              },
            },
          },
          [MethodSymbols.get]: ACTIONS.GET_CLIENT,
        },
      },
    },
  },
};

type HandlerType = () => { body: string };

describe('list', () => {
  const router = new RouterTree<HandlerType>(state);

  const testPathsWithHandlers = ([path, { expectedResponseBody, handler: mockFunction }]) =>
    it('Should return handler for ' + path, () => {
      const handler = router.get(path);

      expect(handler).toBeDefined();
      expect(typeof handler).toEqual('function');
      expect(handler).toBe(mockFunction);

      const result = handler();
      const { body } = result;
      expect(expectedResponseBody).toEqual(body);

      expect(mockFunction).toBeCalledTimes(1);
    });

  const testUndefinedPaths = (path) =>
    it('Should not return handler for undefined path ' + path, () => {
      expect(router.get(path)).toEqual(undefined);
    });

  arrayOfUndefinedEndpoints.forEach(testUndefinedPaths);
  Object.entries(PATH_AND_ACTIONS).forEach(testPathsWithHandlers);
});

// describe('insert', () => {
//   const router = new RouterTree<HandlerType>();
//   it('Should save the path', () => {
//     const handler = jest.fn();
//     router.insert('GET:::/users/clients/:id/bills/:from/:to', handler);

//     const routeHandler = router.get()
//   });
// });
