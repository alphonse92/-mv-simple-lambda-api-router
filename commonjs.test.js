/* eslint-disable @typescript-eslint/no-var-requires */

const { AwsSamRouter, AwsProxyRouter } = require('./dist/classes');
const AwsSamRouterClass = require('./dist/classes/AwsSamRouter');

const AwsProxyRouterClass = require('./dist/classes/AwsProxyRouter');

describe('CommonJS imports', () => {
  it('Should import AwsSamRouter', () => {
    expect(AwsSamRouter).toBe(AwsSamRouterClass.default);
  });

  it('Should import AwsProxyRouter', () => {
    expect(AwsProxyRouter).toBe(AwsProxyRouterClass.default);
  });
});
