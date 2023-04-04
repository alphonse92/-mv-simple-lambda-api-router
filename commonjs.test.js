/* eslint-disable @typescript-eslint/no-var-requires */

const { AwsSamRouter, AwsProxyRouter, ProxyRouter, BaseRouter } = require('./dist/classes');
const AwsSamRouterClass = require('./dist/classes/AwsSamRouter');
const AwsProxyRouterClass = require('./dist/classes/AwsProxyRouter');
const ProxyRouterClass = require('./dist/classes/ProxyRouter');
const BaseRouterClass = require('./dist/classes/BaseRouter');

describe('CommonJS imports', () => {
  it('Should import AwsSamRouter', () => {
    expect(AwsSamRouter).toBe(AwsSamRouterClass.default);
  });

  it('Should import AwsProxyRouter', () => {
    expect(AwsProxyRouter).toBe(AwsProxyRouterClass.default);
  });
  it('Should import ProxyRouter', () => {
    expect(ProxyRouter).toBe(ProxyRouterClass.default);
  });
  it('Should import BaseRouter', () => {
    expect(BaseRouter).toBe(BaseRouterClass.default);
  });
});
