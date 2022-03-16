import fs from 'fs-extra';
import path from 'path';
import glob from 'glob-promise';
import { parseReact } from '@delver/react';
import { logMuted, logError } from './logger';
import type { Config } from '../types';

async function react(config: Config) {
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
    logError(error as string);
    process.exit(1);
  }
}

export default react;
