#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';
import glob from 'glob-promise';
import { parseReact } from '@delver/react';
import { parseCss } from '@delver/css';
import { logMuted, logSuccess, logError } from '@delver/logger';

function makeDefaultConfig(config = {}) {
  return {
    react: {
      output: 'dist/delve.json',
      include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)',
      ignoreSubComponents: false,
      raw: false,
      ...config.react
    },
    css: {
      output: 'dist/css.json',
      include: 'src/**/*.?(s)css',
      ...config.css
    }
  };
}

async function react(config) {
  const { include, ignore, output, ...rest } = config.react;
  logMuted(`Running react`);

  try {
    // Get files using the provided glob pattern
    const files = await glob(include, { ignore });
    logMuted(`Parsing ${files.length} files`);

    // Parse and process using @delver/react
    const result = parseReact(files, rest);
    logMuted(`Found ${result.length} unique components`);

    // Write the results to disk
    const outputPath = path.resolve(process.cwd(), output);
    logMuted(`Writing ${output}`);
    await fs.outputFile(outputPath, JSON.stringify(result));
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

async function css(config) {
  const { include, ignore, output, ...rest } = config.css;
  logMuted(`Running css`);

  try {
    // Get files using the provided glob pattern
    const files = await glob(include, { ignore });
    logMuted(`Parsing ${files.length} files`);

    // Parse and process using @delver/css
    const result = parseCss(files, rest);

    // Write the results to disk
    const outputPath = path.resolve(process.cwd(), output);
    logMuted(`Writing ${output}`);
    await fs.outputFile(outputPath, JSON.stringify(result));
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

export function lib(userConfig) {
  const startTime = process.hrtime.bigint();
  const config = makeDefaultConfig(userConfig);

  const finish = () => {
    const endTime = process.hrtime.bigint();
    logSuccess(
      `Finished in ${Number(endTime - startTime) / 1e9} seconds`
    );
  };

  return {
    react: async () => {
      await react(config);
      finish();
    },
    css: async () => {
      await css(config);
      finish();
    }
  };
}
