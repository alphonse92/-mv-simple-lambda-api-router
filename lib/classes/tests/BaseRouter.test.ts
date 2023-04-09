/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import AwsProxyRouter from '../AwsProxyRouter';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';

const methods = ['post', 'get', 'put', 'delete'];
const hasPathArguments = (path) => path.includes(':');
const getRandomPath = () => `${faker.random.alphaNumeric(10)}${faker.datatype.boolean() ? '/:id' : ''}`;
const getRandomMethod = () => methods[faker.datatype.number({ min: 0, max: methods.length - 1 })];
const getEmptyArray = (length) => Array.from(new Array(length));
const getArrayOfPaths = (length) => getEmptyArray(length).map(getRandomPath);
const getArrayOfRoutes = (paths) =>
  paths.map((path) => ({
    controller: jest.fn().mockResolvedValue({ statusCode: 200, body: path }),
    method: getRandomMethod(),
    path,
  }));

const length = 50000;

console.log(`Creating array of ${length} routes`);

const arrayOfRoutes = getArrayOfRoutes(getArrayOfPaths(length));
const start = 0;
const mid = arrayOfRoutes.length / 2;
const end = arrayOfRoutes.length - 1;
const arrayOfRoutesPart1 = arrayOfRoutes.slice(start, mid);
const arrayOfRoutesPart2 = arrayOfRoutes.slice(mid + 1, end);

console.log(
  'Array of routes created. First array len',
  arrayOfRoutesPart1.length,
  'second array len',
  arrayOfRoutesPart2.length,
  'total',
  arrayOfRoutesPart1.length + arrayOfRoutesPart2.length,
);

describe('BaseRouter.ts test', () => {
  let handler, totalTime;

  it('Should add 50K routes in less than 100 ms', () => {
    const router = new AwsProxyRouter();

    const startTime = performance.now();
    router.use(arrayOfRoutesPart1);
    router.use(arrayOfRoutesPart2);
    const endTime = performance.now();

    handler = router.expose();
    totalTime = endTime - startTime;

    console.log('Router exposed after', totalTime, 'ms');
  }, 100);

  function test(route) {
    const { controller, path, method } = route;
    it(`Check if path ${method} ${path} is available`, async () => {
      const hasArgumentPath = hasPathArguments(path);
      const pathWithArgs = hasArgumentPath ? `${path.replace('/:id', '/id')}` : path;
      const result = await handler({ path: pathWithArgs, httpMethod: method } as APIGatewayProxyEvent, {} as Context);

      const { statusCode, body } = result;

      expect(body).toEqual(path);
      expect(statusCode).toEqual(200);
      expect(controller).toBeCalledTimes(1);
    });
  }

  arrayOfRoutesPart2.slice(0, 100).forEach(test);
});
