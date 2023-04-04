import { faker } from '@faker-js/faker';
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { NotFoundError } from '../../errors/http';
import { createController } from '../../utils/controller';
import AwsProxyRouter, { HandlerType } from '../AwsProxyRouter';
import BaseRouter from '../BaseRouter';

describe('AwsProxyRouter', () => {
  it('Should route succesfully', async () => {
    const controllerResult = { statusCode: 200, body: faker.datatype.string() };
    const path = '/resource/';
    const httpMethod = 'GET';
    const router = new AwsProxyRouter();
    router.use(
      path,
      createController<HandlerType>({
        get: async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
          return controllerResult;
        },
      }),
    );

    const handler = router.expose();

    const response = await handler({ path, httpMethod } as APIGatewayProxyEvent, {} as Context);

    expect(response).toEqual(controllerResult);
  });

  it('Should route succesfully even if method is in lower case', async () => {
    const controllerResult = { statusCode: 200, body: faker.datatype.string() };
    const path = '/resource/';
    const httpMethod = 'get';
    const router = new AwsProxyRouter();
    router.use(
      path,
      createController<HandlerType>({
        get: async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
          return controllerResult;
        },
      }),
    );

    const handler = router.expose();

    const response = await handler({ path, httpMethod } as APIGatewayProxyEvent, {} as Context);

    expect(response).toEqual(controllerResult);
  });

  it('Should route through many resources', async () => {
    const getResult = { statusCode: 200, body: faker.datatype.string() };
    const postResult = { statusCode: 200, body: faker.datatype.string() };

    const router = new AwsProxyRouter();

    router.use(
      '/res1/',
      createController<HandlerType>({
        get: async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
          return getResult;
        },
      }),
    );

    router.use(
      '/res2/',
      createController<HandlerType>({
        post: async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
          return postResult;
        },
      }),
    );

    const handler = router.expose();

    const response = await handler({ path: '/res1/', httpMethod: 'GET' } as APIGatewayProxyEvent, {} as Context);
    expect(response).toEqual(getResult);

    const response2 = await handler({ path: '/res2/', httpMethod: 'POST' } as APIGatewayProxyEvent, {} as Context);
    expect(response2).toEqual(postResult);
  });

  it('Should return an error if resource does not exist', async () => {
    const getResult = { statusCode: 200, body: faker.datatype.string() };
    const get = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      return getResult;
    };

    const router = new AwsProxyRouter();

    router.use(
      '/resource/',
      createController<HandlerType>({
        get,
      }),
    );

    const handler = router.expose();

    const result = await handler({ path: '/res1/', httpMethod: 'GET' } as APIGatewayProxyEvent, {} as Context);

    expect(result).toEqual(BaseRouter.errorToHttpError(NotFoundError));
  });

  it('Should return an error if handler does not exist', async () => {
    const getResult = { statusCode: 200, body: faker.datatype.string() };
    const get = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
      return getResult;
    };

    const router = new AwsProxyRouter();

    router.use(
      '/resource/',
      createController<HandlerType>({
        get,
      }),
    );

    const handler = router.expose();
    let error;
    const result = await handler({ path: '/resource/', httpMethod: 'POST' } as APIGatewayProxyEvent, {} as Context);
    expect(result).toEqual(BaseRouter.errorToHttpError(NotFoundError));
  });
});
