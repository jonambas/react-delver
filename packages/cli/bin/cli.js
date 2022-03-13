#!/usr/bin/env node
import meow from 'meow';
import chalk from 'chalk';
import { findUp } from 'find-up';
import { logMuted, logInfo } from '@delver/logger';
import { lib } from '../lib/lib.js';

const cli = meow(
  `
  ${chalk.blueBright('delve')} - React component analytics

  ${chalk.bold('USAGE')}
    $ ${chalk.blueBright('delve')} [command] [options...]

  ${chalk.bold('OPTIONS')}
    --help, -h     Displays this usage guide
    --version, -v  Displays version info

  ${chalk.bold('COMMANDS')}
    react          Runs the React parser
    css            Runs the CSS parser
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

async function delve(command, flags) {
  const { version, help } = flags;

  if (version) {
    cli.showVersion();
    process.exit(0);
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

  const delve = lib(config);

  if (delve.hasOwnProperty(command)) {
    await delve[command]();
    process.exit(0);
  } else {
    logInfo(`Command '${command}' not found.`);
    cli.showHelp();
    process.exit(1);
  }
}

delve(cli.input[0], cli.flags);
