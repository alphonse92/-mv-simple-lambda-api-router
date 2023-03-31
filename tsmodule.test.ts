import AwsSamRouterClass from './dist/classes/AwsSamRouter';
import AwsProxyRouterClass from './dist/classes/AwsProxyRouter';

import { AwsProxyRouter, AwsSamRouter } from './dist/classes';

describe('Ts Modules', () => {
  it('Should import AwsSamRouter', () => {
    expect(AwsSamRouter).toBeDefined();
    expect(AwsSamRouterClass).toBeDefined();
  });

  it('Should import AwsProxyRouter', () => {
    expect(AwsProxyRouter).toBeDefined();
    expect(AwsProxyRouterClass).toBeDefined();
  });
});
