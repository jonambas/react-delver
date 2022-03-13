#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import glob from 'glob-promise';
import { parseReact } from '@delver/react';
import { logMuted, logSuccess, logError } from '@delver/logger';

function makeDefaultConfig(config) {
  return {
    output: 'dist/delve.json',
    include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)',
    ignoreSubComponents: false,
    raw: false,
    ...config
  };
}

async function start(config) {
  const { include, ignore, ...rest } = config;

  try {
    // Get files using the provided glob pattern
    const files = await glob(include, { ignore });
    logMuted(`Parsing ${files.length} files.`);

    // Parse and process using @delver/react
    const result = parseReact(files, rest);

    // Write the results to disk
    const outputPath = path.resolve(process.cwd(), config.output);
    logMuted(`Writing – ${config.output}`);
    await fs.outputFile(outputPath, JSON.stringify(result));
  } catch (error) {
    logError(err);
    process.exit(1);
  }
}

export async function lib(userConfig) {
  const startTime = process.hrtime.bigint();
  const config = makeDefaultConfig(userConfig);
  await start(config);

  const endTime = process.hrtime.bigint();
  logSuccess(`Finished in ${Number(endTime - startTime) / 1e9} seconds.`);
  process.exit(0);
}
