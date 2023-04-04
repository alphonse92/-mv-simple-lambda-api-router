/* eslint-disable @typescript-eslint/no-unused-vars */
import { APIGatewayProxyResult, APIGatewayProxyEvent, Context } from 'aws-lambda';
import Route from '../Route';
import AwsProxyRouter from '../../classes/AwsProxyRouter';

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
  @Route('get', '/user/:id')
  async getUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.getUser();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('get', '/user')
  async getUsers(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.getUsers();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('post', '/user')
  async createUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.createUser();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('delete', '/user/:id')
  async deleteUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.deleteUser();
    return { statusCode: 200, body: 'ok' };
  }
}

class ClientsController {
  @Route('get', '/user/clients/:id')
  async getClient(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.getClient();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('get', '/user/clients')
  async getClients(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.getClients();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('post', '/user/clients')
  async createClient(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.createClient();
    return { statusCode: 200, body: 'ok' };
  }

  @Route('delete', '/user/clients/:id')
  async deleteClient(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    userService.deleteClient();
    return { statusCode: 200, body: 'ok' };
  }
}
const router = new AwsProxyRouter();
const userController = new UserController();
const clientsController = new ClientsController();

router.use(userController.getUser);
router.use(userController.getUsers);
router.use(userController.createUser);
router.use(userController.deleteUser);

router.use(clientsController.getClient);
router.use(clientsController.getClients);
router.use(clientsController.createClient);
router.use(clientsController.deleteClient);

const handler = router.expose();

function assert(serviceFn, { path, httpMethod }) {
  it(`should route to ${httpMethod} ${path}`, async () => {
    const result = await handler({ path, httpMethod } as APIGatewayProxyEvent, {} as Context);
    expect(result.body).toEqual('ok');
    expect(serviceFn).toHaveBeenCalled();
  });
}

describe('Route decorator + AWSProxyRouter', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  assert(userService.getUser, { path: '/user/userid/', httpMethod: 'GET' });
  assert(userService.getUsers, { path: '/user/', httpMethod: 'GET' });
  assert(userService.createUser, { path: '/user/', httpMethod: 'POST' });
  assert(userService.deleteUser, { path: '/user/userid/', httpMethod: 'DELETE' });
  assert(userService.getClient, { path: '/user/clients/userid/', httpMethod: 'GET' });
  assert(userService.getClients, { path: '/user/clients/', httpMethod: 'GET' });
  assert(userService.createClient, { path: '/user/clients/', httpMethod: 'POST' });
  assert(userService.deleteClient, { path: '/user/clients/userid/', httpMethod: 'DELETE' });
});
