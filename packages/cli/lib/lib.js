#!/usr/bin/env node
import fs from 'fs-extra';
/* @ts-ignore */
import path from 'path';
import glob from 'glob';
import { parseFiles } from '@delver/react';
import { logMuted, logSuccess } from '@delver/logger';

function makeDefaultConfig(config) {
  return {
    output: 'dist/delve.json',
    include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)',
    ignoreSubComponents: false,
    raw: false,
    ...config
  };
}

function start(config) {
  const startTime = process.hrtime.bigint();
  const { include, ignore, ...rest } = config;

  glob(include, { ignore }, (err, files) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const result = parseFiles(files, rest);
    const outputPath = path.resolve(process.cwd(), config.output);

    fs.outputFileSync(outputPath, JSON.stringify(result));

    const endTime = process.hrtime.bigint();
    logSuccess(`Finished in ${Number(endTime - startTime) / 1e9} seconds.`);
    logMuted(`${outputPath}`);
  });
}

export function lib(userConfig) {
  const config = makeDefaultConfig(userConfig);
  start(config);
}
