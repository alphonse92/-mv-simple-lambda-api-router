/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import shuffle from 'lodash/shuffle';
import AwsProxyRouter, { HandlerResultType } from '../AwsProxyRouter';
// import AwsSamRouter, { HandlerResultType } from '../AwsSamRouter';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';

const methods = ['post', 'get', 'put', 'delete'];
const getRandomMethod = () => methods[faker.datatype.number({ min: 0, max: methods.length - 1 })];
const getArrayOfPaths = (length) => Array.from(new Array(length)).map(() => faker.random.alphaNumeric(10));
const getArrayOfRoutes = (paths) =>
  paths.map((path) => ({
    controller: jest.fn().mockResolvedValue({ statusCode: 200, body: 'ok' }),
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
      const result = await handler({ path, httpMethod: method } as APIGatewayProxyEvent, {} as Context);

      const { statusCode, body } = result;

      expect(body).toEqual('ok');
      expect(statusCode).toEqual(200);
      expect(controller).toBeCalledTimes(1);
    });
  }

  shuffle(arrayOfRoutesPart2.concat(arrayOfRoutesPart1)).slice(0, 1000).forEach(test);
});
