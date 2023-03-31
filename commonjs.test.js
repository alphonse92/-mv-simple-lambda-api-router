/* eslint-disable @typescript-eslint/no-var-requires */

const { faker } = require('@faker-js/faker');
const { NotImplementedControllerError, NotImplementedHandler } = require('./dist/errors/http');
const { createController } = require('./dist/utils/controller');
const { AwsSamRouter } = require('./dist/classes');

describe('AwsSamRouter', () => {
  it('Should route succesfully', async () => {
    const controllerResult = { statusCode: 200, body: faker.datatype.string() };
    const resource = '/resource/';
    const httpMethod = 'GET';
    const router = new AwsSamRouter();
    router.use(
      resource,
      createController({
        get: async (event, context) => {
          return controllerResult;
        },
      }),
    );

    const handler = router.expose();

    const response = await handler({ resource, httpMethod });

    expect(response).toEqual(controllerResult);
  });

  it('Should route succesfully even if method is in lower case', async () => {
    const controllerResult = { statusCode: 200, body: faker.datatype.string() };
    const resource = '/resource/';
    const httpMethod = 'get';
    const router = new AwsSamRouter();
    router.use(
      resource,
      createController({
        get: async (event, context) => {
          return controllerResult;
        },
      }),
    );

    const handler = router.expose();

    const response = await handler({ resource, httpMethod });

    expect(response).toEqual(controllerResult);
  });

  it('Should route through many resources', async () => {
    const getResult = { statusCode: 200, body: faker.datatype.string() };
    const postResult = { statusCode: 200, body: faker.datatype.string() };

    const router = new AwsSamRouter();

    router.use(
      '/res1/',
      createController({
        get: async (event, context) => {
          return getResult;
        },
      }),
    );

    router.use(
      '/res2/',
      createController({
        post: async (event, context) => {
          return postResult;
        },
      }),
    );

    const handler = router.expose();

    const response = await handler({ resource: '/res1/', httpMethod: 'GET' });
    expect(response).toEqual(getResult);

    const response2 = await handler({ resource: '/res2/', httpMethod: 'POST' });
    expect(response2).toEqual(postResult);
  });

  it('Should return an error if resource does not exist', async () => {
    const getResult = { statusCode: 200, body: faker.datatype.string() };
    const get = async (event, context) => {
      return getResult;
    };

    const router = new AwsSamRouter();

    router.use(
      '/resource/',
      createController({
        get,
      }),
    );

    const handler = router.expose();
    let error;
    try {
      await handler({ resource: '/res1/', httpMethod: 'GET' });
    } catch (e) {
      error = e;
    }
    expect(error).toBe(NotImplementedControllerError);
  });

  it('Should return an error if handler does not exist', async () => {
    const getResult = { statusCode: 200, body: faker.datatype.string() };
    const get = async (event, context) => {
      return getResult;
    };

    const router = new AwsSamRouter();

    router.use(
      '/resource/',
      createController({
        get,
      }),
    );

    const handler = router.expose();
    let error;
    try {
      await handler({ resource: '/resource/', httpMethod: 'POST' });
    } catch (e) {
      error = e;
    }
    expect(error).toBe(NotImplementedHandler);
  });
});
