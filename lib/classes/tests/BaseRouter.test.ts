/* eslint-disable @typescript-eslint/no-unused-vars */
import AwsProxyRouter from '../AwsProxyRouter';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { arrayOfRoutes, arrayOfRoutesPart1, arrayOfRoutesPart2 } from './mocks/routes.mocks';

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
    const { controller, path, method, tests } = route;

    for (const pathTest of tests) {
      it(`Check if path ${method} ${pathTest} is available.`, async () => {
        const mockController = controller as jest.Mock;
        const result = await handler({ path: pathTest, httpMethod: method } as APIGatewayProxyEvent, {} as Context);
        const { statusCode, body } = result;
        expect(body).toEqual(path);
        expect(statusCode).toEqual(200);
        expect(mockController).toBeCalledTimes(1);
      });
    }
  }

  arrayOfRoutesPart2
    .filter(({ tests }) => Boolean(tests.length))
    .slice(0, 100)
    .forEach(test);
});
