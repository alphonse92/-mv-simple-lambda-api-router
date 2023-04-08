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

const ACTIONS = {
  VERSION: jest.fn().mockResolvedValue({ body: 'version app' }),
  LIST_USERS: jest.fn().mockResolvedValue({ body: 'list of users' }),
  GET_USER: jest.fn().mockResolvedValue({ body: 'user entity' }),
  NEW_USER: jest.fn().mockResolvedValue({ body: 'new user' }),
  UPDATE_USER: jest.fn().mockResolvedValue({ body: 'user updated' }),
  DELETE_USER: jest.fn().mockResolvedValue({ body: 'user deleted' }),
  LIST_CLIENTS: jest.fn().mockResolvedValue({ body: 'list of clients' }),
  GET_CLIENT: jest.fn().mockResolvedValue({ body: 'client entity' }),
  NEW_CLIENT: jest.fn().mockResolvedValue({ body: 'new client' }),
  GET_BILL: jest.fn().mockResolvedValue({ body: 'get bill' }),
  GET_BILLS: jest.fn().mockResolvedValue({ body: 'bills from to' }),
};

const PATHS = {
  VERSION: 'GET:::/',
  LIST_USERS: 'GET:::/users/',
  GET_USER: 'GET:::/users/userid',
  NEW_USER: 'POST:::/users/',
  UPDATE_USER: 'PUT:::/users/',
  DELETE_USER: 'DELETE:::/users/userid',
  LIST_CLIENTS: 'GET:::/users/clients/',
  GET_CLIENT: 'GET:::/users/clients/clientid',
  NEW_CLIENT: 'POST:::/users/clients/',
  GET_BILL: 'GET:::/users/clients/clientid/bills/billid',
  GET_BILLS: 'GET:::/users/clients/clientid/bills/2023-04-04/2023-03-04',
};

const PATH_AND_ACTIONS = {
  // [PATHS.VERSION]: ACTIONS.VERSION,
  // [PATHS.LIST_USERS]: ACTIONS.LIST_USERS,
  // [PATHS.GET_USER]: ACTIONS.GET_USER,
  // [PATHS.NEW_USER]: ACTIONS.NEW_USER,
  // [PATHS.UPDATE_USER]: ACTIONS.UPDATE_USER,
  // [PATHS.DELETE_USER]: ACTIONS.DELETE_USER,
  // [PATHS.LIST_CLIENTS]: ACTIONS.LIST_CLIENTS,
  // [PATHS.GET_CLIENT]: ACTIONS.GET_CLIENT,
  // [PATHS.NEW_CLIENT]: ACTIONS.NEW_CLIENT,
  // [PATHS.GET_BILL]: ACTIONS.GET_BILL,
  [PATHS.GET_BILLS]: ACTIONS.GET_BILLS,
};

const state = {
  '/': {
    [MethodSymbols.get]: ACTIONS.VERSION,
    users: {
      [MethodSymbols.get]: ACTIONS.LIST_USERS,
      [MethodSymbols.post]: ACTIONS.NEW_USER,
      [MethodSymbols.put]: ACTIONS.UPDATE_USER,
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

type HandlerType = () => true;

describe('list', () => {
  const router = new RouterTree<HandlerType>(state);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  const testPathsWithHandlers = ([path, mockHandler]) =>
    it('Should  return controller for path ' + path, () => {
      const handler = router.get(path);

      expect(handler).toBeDefined();
      expect(typeof handler).toEqual('function');
      expect(handler).toBe(mockHandler);

      handler();

      expect(mockHandler).toBeCalledTimes(1);
    });

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
