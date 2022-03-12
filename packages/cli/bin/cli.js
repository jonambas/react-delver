#! /usr/bin/env node
import fs from 'fs';
import meow from 'meow';
import chalk from 'chalk';
import { findUp } from 'find-up';
import { logMuted } from '@delver/logger';
import lib from '../lib/index.js';

const cli = meow(
  `
  ${chalk.blueBright('delve')} - React component analytics

  ${chalk.bold('USAGE')}
    $ ${chalk.blueBright('delve')} [options...]

  ${chalk.bold('OPTIONS')}
    --config, -c   Path to config, default './.delverc'
    --help, -h     Displays this usage guide
    --version, -v  Displays version info
`,
  {
    importMeta: import.meta,
    flags: {
      help: {
        type: 'boolean',
        alias: 'h'
      },
      version: {
        type: 'boolean',
        alias: 'v'
      },
      output: {
        type: 'string',
        alias: 'o',
        default: './delve'
      }
    }
  }
);

async function delve(flags) {
  if (flags.version) {
    cli.showVersion(1);
  }

  if (flags.help) {
    cli.showHelp();
    process.exit(1);
  }

  const configPath = await findUp('.delverc');
  let config = {};

  if (!configPath) {
    logMuted('.delverc not found. Using default settings.');
  } else {
    config = fs.readFileSync(configPath);
  }

  lib(config);
}

delve(cli.flags);
