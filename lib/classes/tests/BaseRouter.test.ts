/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import AwsProxyRouter from '../AwsProxyRouter';
import { Context, APIGatewayProxyEvent } from 'aws-lambda';
import { HandlerResultType } from '../AwsProxyRouter';

const methods = ['post', 'get', 'put', 'delete'];
const getRandomMethod = () => methods[faker.datatype.number({ min: 0, max: methods.length - 1 })];
const getArrayOfPaths = (length) => Array.from(new Array(length)).map(() => faker.random.alphaNumeric(10));
const getArrayOfRoutes = (paths) =>
  paths.map((path) => ({
    controller: jest.fn(),
    method: getRandomMethod(),
    path,
  }));

const length = 50000;
const router = new AwsProxyRouter();
console.log(`Creating array of ${length} routes`);
const arrayOfRoutes = getArrayOfRoutes(getArrayOfPaths(length));
console.log('Array of routes created');
const startTime = performance.now();

router.use(arrayOfRoutes);

const endTime = performance.now();
const totalTime = endTime - startTime;

const handler = router.expose();
console.log('Router exposed after', totalTime, 'ms');
describe('BaseRouter.ts test', () => {
  it('Should add 50K routes in less than 100 ms', () => {
    expect(totalTime).toBeLessThan(100);
  });

  it('All routes should be available', () => {
    for (let i = arrayOfRoutes.length - 1; i > 0; i--) {
      const { controller, path, method } = arrayOfRoutes[i];
      const result: HandlerResultType = handler({ path, httpMethod: method } as APIGatewayProxyEvent, {} as Context);
      expect(controller).toBeCalledTimes(1);
    }
  });
});
