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
  NEW_USER: jest.fn().mockResolvedValue({ body: 'new user' }),
  UPDATE_USER: jest.fn().mockResolvedValue({ body: 'user updated' }),
  GET_USER: jest.fn().mockResolvedValue({ body: 'user entity' }),
  DELETE_USER: jest.fn().mockResolvedValue({ body: 'user deleted' }),

  GET_CLIENT: jest.fn().mockResolvedValue({ body: 'client entity' }),
  NEW_CLIENT: jest.fn().mockResolvedValue({ body: 'new client' }),
  LIST_CLIENTS: jest.fn().mockResolvedValue({ body: 'list of clients' }),
  GET_BILLS: jest.fn().mockResolvedValue({ body: 'bills from to' }),

  GET_BILL: jest.fn().mockResolvedValue({ body: 'get bill' }),
};

const PathTreeKeys = {
  // root path
  'GET:::/': ACTIONS.VERSION,

  // user paths
  'GET:::/users/': ACTIONS.LIST_USERS,
  'GET:::/users/userid': ACTIONS.GET_USER,
  'POST:::/users/': ACTIONS.NEW_USER,
  'PUT:::/users/': ACTIONS.UPDATE_USER,
  'DELETE:::/users/userid': ACTIONS.DELETE_USER,

  // client paths
  'GET:::/users/clients/': ACTIONS.LIST_CLIENTS,
  'GET:::/users/clients/clientid': ACTIONS.GET_CLIENT,
  'POST:::/users/clients/': ACTIONS.NEW_CLIENT,
  'GET:::/users/clients/clientid/bills/billid': ACTIONS.GET_BILL,
  'GET:::/users/clients/:id/bills/:from/:to': ACTIONS.GET_BILLS,
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
const testPathsWithHandlers = ([path, mockHandler]) =>
  it('Should  return controller for path ' + path, () => {
    const router = new RouterTree<HandlerType>(state);
    const handler = router.get(path);

    expect(handler).toBeDefined();
    expect(typeof handler).toEqual('function');
    expect(handler).toBe(mockHandler);

    handler();

    expect(mockHandler).toBeCalledTimes(1);
  });

describe('Router tree get handler', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  Object.entries(PathTreeKeys).forEach(testPathsWithHandlers);
});
