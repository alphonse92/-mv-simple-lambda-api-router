/* eslint-disable @typescript-eslint/no-var-requires */
const { faker } = require('@faker-js/faker');
const fs = require('fs');

/**
 * user/1/
 * user/1/bills
 * user/1/settings
 * client/1/
 */
const MAX_DEPTH = 12;
const REPEAT_SAME_ROOT = 30;
const N_ROOTS = 20;
const N_TESTS = 50;
const PARAMETER_TOKEN = ':parameter';
const methods = ['POST', 'GET', 'PUT', 'DELETE'];

function randomStr() {
  return faker.random.alphaNumeric(10).toLowerCase();
}

function getRandomTokens(addParameter) {
  if (addParameter) {
    return [PARAMETER_TOKEN];
  }

  return [randomStr()];
}

function getRandomTokensRows(lastTokenRow) {
  const currentIndex = lastTokenRow.length;
  const addParameter = currentIndex > 0 && currentIndex % 2 !== 0;
  const newRows = [[...lastTokenRow, ...getRandomTokens(addParameter)]];

  if (currentIndex > 0) {
    for (let i = 0; i < REPEAT_SAME_ROOT; i++) {
      newRows.push([...lastTokenRow, ...getRandomTokens()]);
    }
  }

  return newRows;
}

function getPathToken(arrayOfTokens = []) {
  const lastTokenRow = arrayOfTokens[arrayOfTokens.length - 1] ?? [];

  if (lastTokenRow.length > MAX_DEPTH) {
    return arrayOfTokens;
  }
  const newRows = getRandomTokensRows(lastTokenRow);

  return getPathToken([...arrayOfTokens, ...newRows]);
}

function getTestsForPath(originalPath) {
  const tests = [];
  for (let i = 0; i < N_TESTS; i++) {
    tests.push(
      originalPath.replaceAll(':parameter', (lookingFor, indexFound) => {
        return `parameter${i}${indexFound}`;
      }),
    );
  }

  return tests;
}

const getMapOfPathsAndMethods = (originalPath) => {
  return methods.reduce((acc, method) => {
    const pathInfo = {
      method: method.toUpperCase(),
      originalPath,
      hasParameters: originalPath.includes(':'),
      tests: [],
    };

    if (pathInfo.hasParameters) {
      pathInfo.tests = getTestsForPath(originalPath);
    }

    const path = `${pathInfo.method}:::${originalPath}`;
    return { ...acc, [path]: pathInfo };
  }, {});
};

const listOfPaths = Array.from(new Array(N_ROOTS)).reduce((acc) => [...acc, ...getPathToken()], []);
const mapOfPaths = listOfPaths.reduce((all, tokens) => {
  const out = { ...all };
  const path = `/${tokens.join('/')}`;
  const methodPathMap = getMapOfPathsAndMethods(path);
  return {
    ...out,
    ...methodPathMap,
  };
}, []);

const entries = Object.entries(mapOfPaths);
const entriesWithParameters = entries.filter(([path, config]) => config.hasParameters);
const lastEntry = entries[entries.length - 1];
const lastEntryWithParameters = entriesWithParameters[entriesWithParameters.length - 1];

const repeated = listOfPaths.length - entries.length / methods.length;

console.table(listOfPaths);
console.log(JSON.stringify({ lastEntry, lastEntryWithParameters }, null, 2));
console.log('repeated paths', repeated);

const fileData = JSON.stringify(mapOfPaths, null, 2);

fs.writeFileSync(process.env.MOCK_FOLDER, fileData);
