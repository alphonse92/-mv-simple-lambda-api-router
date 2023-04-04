/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Route from '../Route';
import AwsSamRouter from '../../classes/AwsSamRouter';

const userService = {
  getUser: jest.fn(),
  getUsers: jest.fn(),
  createUser: jest.fn(),
  deleteUser: jest.fn(),
  getClient: jest.fn(),
  getClients: jest.fn(),
  createClient: jest.fn(),
  deleteClient: jest.fn(),
};

class UserController {
  @Route('get', '/user/{id}/')
  async getUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.getUser();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('get', '/user/')
  async getUsers(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.getUsers();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('post', '/user/')
  async createUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.createUser();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('delete', '/user/{id}/')
  async deleteUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.deleteUser();
    return { statusCode: 200, body: 'ok' };
  }
}

class ClientsController {
  @Route('get', '/user/clients/{id}/')
  async getClient(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.getClient();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('get', '/user/clients/')
  async getClients(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.getClients();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('post', '/user/clients/')
  async createClient(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.createClient();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('delete', '/user/clients/{id}')
  async deleteClient(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.deleteClient();
    return { statusCode: 200, body: 'ok' };
  }
}
const router = new AwsSamRouter();
const userController = new UserController();
const clientsController = new ClientsController();

router.use(clientsController.getClient);
router.use(clientsController.getClients);
router.use(clientsController.createClient);
router.use(clientsController.deleteClient);

router.use(userController.getUser);
router.use(userController.getUsers);
router.use(userController.createUser);
router.use(userController.deleteUser);

const handler = router.expose();

function assert(serviceFn, { resource, httpMethod }) {
  it(`should route to ${httpMethod} ${resource}`, async () => {
    const result = await handler({ resource, httpMethod } as APIGatewayProxyEvent, {} as Context);
    expect(result.body).toEqual('ok');
    expect(serviceFn).toHaveBeenCalled();
  });
}

describe('Route decorator + AWSProxyRouter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  assert(userService.getUser, { resource: '/user/{id}/', httpMethod: 'GET' });
  assert(userService.getUsers, { resource: '/user/', httpMethod: 'GET' });
  assert(userService.createUser, { resource: '/user/', httpMethod: 'POST' });
  assert(userService.deleteUser, { resource: '/user/{id}/', httpMethod: 'DELETE' });
  assert(userService.getClient, { resource: '/user/clients/{id}/', httpMethod: 'GET' });
  assert(userService.getClients, { resource: '/user/clients/', httpMethod: 'GET' });
  assert(userService.createClient, { resource: '/user/clients/', httpMethod: 'POST' });
  assert(userService.deleteClient, { resource: '/user/clients/{id}', httpMethod: 'DELETE' });
});
