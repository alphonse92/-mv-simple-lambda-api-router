/* eslint-disable @typescript-eslint/no-var-requires */
const { build } = require('esbuild');
const { dependencies = {}, peerDependencies = {} } = require('./package.json');

const sharedConfig = {
  entryPoints: ['lib/index.ts', 'lib/classes/AwsSamRouter.ts', 'lib/utils/controller.ts', 'lib/errors/http.ts'],
  bundle: true,
  minify: true,
  external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
};

build({
  ...sharedConfig,
  platform: 'node', // for CJS
  outbase: 'lib',
  outdir: 'dist/',
});
