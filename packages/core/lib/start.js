import fs from 'fs';
import path from 'path';
import glob from 'glob';
import parse from './parse.js';
import { logMuted, logSuccess } from './log.js';

function start(config) {
  const startTime = process.hrtime.bigint();
  const { include, ignore, ...rest } = config;

  glob(include, { ignore }, (err, files) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const result = parse(files, rest);
    const outputPath = path.resolve(process.cwd(), config.output);

    fs.writeFileSync(outputPath, JSON.stringify(result));

    const endTime = process.hrtime.bigint();
    logSuccess(`Finished in ${Number(endTime - startTime) / 1e9} seconds`);
    logMuted(`${outputPath}`);
  });
}

export default start;
