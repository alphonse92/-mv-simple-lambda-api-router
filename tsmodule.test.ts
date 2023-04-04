import AwsSamRouterClass from './dist/classes/AwsSamRouter';
import AwsProxyRouterClass from './dist/classes/AwsProxyRouter';
import ProxyRouterClass from './dist/classes/ProxyRouter';
import BaseRouterClass from './dist/classes/BaseRouter';

import { AwsProxyRouter, AwsSamRouter, ProxyRouter, BaseRouter } from './dist/classes';

describe('Ts Modules', () => {
  it('Should import AwsSamRouter', () => {
    expect(AwsSamRouter).toBeDefined();
    expect(AwsSamRouterClass).toBeDefined();
    expect(AwsSamRouterClass).toBe(AwsSamRouter);
  });

  it('Should import AwsProxyRouter', () => {
    expect(AwsProxyRouter).toBeDefined();
    expect(AwsProxyRouterClass).toBeDefined();
    expect(AwsProxyRouterClass).toBe(AwsProxyRouter);
  });

  it('Should import ProxyRouter', () => {
    expect(ProxyRouter).toBeDefined();
    expect(ProxyRouterClass).toBeDefined();
    expect(ProxyRouterClass).toBe(ProxyRouter);
  });

  it('Should import ProxyRouter', () => {
    expect(BaseRouter).toBeDefined();
    expect(BaseRouterClass).toBeDefined();
    expect(BaseRouterClass).toBe(BaseRouter);
  });
});
