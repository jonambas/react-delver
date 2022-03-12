#! /usr/bin/env node
import start from './start.js';

function makeDefaultConfig(config) {
  return {
    output: 'dist/delve.json',
    include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)',
    ignoreSubComponents: false,
    raw: false,
    ...config
  };
}

function delve(userConfig) {
  const config = makeDefaultConfig(userConfig);
  start(config);
}

export default delve;
