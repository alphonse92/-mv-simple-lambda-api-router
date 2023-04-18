// eslint-disable-next-line @typescript-eslint/no-var-requires
const pathsJson = require('../../../../mocks/paths.json');
const pathInfoArray = Object.values(pathsJson);

const routes = pathInfoArray.map(({ method, originalPath: path, tests, hasParameters }) => {
  return {
    controller: jest.fn().mockResolvedValue({ statusCode: 200, body: path }),
    path,
    method,
    tests,
    hasParameters,
  };
});

const tooLongPath =
  '/thisistheroot/:parameter/:parameter/:parameter/:parameter/:parameter/:parameter/:parameter/:parameter/:parameter/:parameter/:parameter/:parameter/end/';

const tooLongPathReplacedParameters = tooLongPath.replaceAll(':parameter', 'long');

export const arrayOfRoutes = [
  ...routes,
  {
    controller: jest.fn().mockResolvedValue({ statusCode: 200, body: tooLongPath }),
    path: tooLongPath,
    method: 'GET',
    tests: [tooLongPathReplacedParameters],
    hasParameters: true,
  },
];

// Divide it into two arrays
const start = 0;
const mid = arrayOfRoutes.length / 2;
const end = arrayOfRoutes.length;

export const arrayOfRoutesPart1 = arrayOfRoutes.slice(start, mid);
export const arrayOfRoutesPart2 = arrayOfRoutes.slice(mid, end);
