#! /usr/bin/env node
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
      }
    }
  }
);

async function delve(flags) {
  const { version, help } = flags;

  if (version) {
    cli.showVersion(1);
  }

  if (help) {
    cli.showHelp();
    process.exit(1);
  }

  const configPath = await findUp('delver.config.js');
  let config = {};

  if (!configPath) {
    logMuted('Using default settings.');
  } else {
    const configImport = await import(configPath);
    config = configImport.default;
  }

  lib(config);
}

delve(cli.flags);
