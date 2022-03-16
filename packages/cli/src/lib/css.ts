import fs from 'fs-extra';
import path from 'path';
import glob from 'glob-promise';
import { parseCss } from '@delver/css';
import { logMuted, logError } from './logger';
import type { Config } from '../types';

async function css(config: Config) {
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
    logError(error as string);
    process.exit(1);
  }
}

export default css;
