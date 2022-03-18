import chalk from 'chalk';
import { startUI } from '@delver/ui';
import react from './react';
import css from './css';
import { logMuted, logSuccess } from './logger';
import type { UserConfig, Config } from '../types';

function makeDefaultConfig(config: UserConfig): Config {
  return {
    cwd: process.cwd(),
    react: {
      output: 'dist/delve.json',
      include: 'src/**/!(*.test|*.spec).@(js|ts)?(x)',
      ignoreSubComponents: false,
      raw: false,
      expressionLength: 40,
      ...config.react
    },
    css: {
      output: 'dist/css.json',
      include: 'src/**/*.?(s)css',
      ...config.css
    },
    ui: {
      port: 9000,
      output: 'dist/ui',
      title: 'react-delver ui',
      ...config.ui
    }
  };
}

async function ui(config: Config) {
  logMuted(`Running ui`);
  // startUI(config);
}

export function lib(userConfig: UserConfig) {
  const startTime = process.hrtime.bigint();
  const config = makeDefaultConfig(userConfig);

  const finish = () => {
    const endTime = process.hrtime.bigint();
    const seconds = Number(endTime - startTime) / 1e9;
    logSuccess(`Finished in ${chalk.bold(`${seconds.toFixed(3)}s`)}`);
  };

  return {
    react: async () => {
      await react(config);
      finish();
    },
    css: async () => {
      await css(config);
      finish();
    },
    ui: async () => {
      logMuted(`This isn't ready yet`);
      // await ui(config);
    }
  };
}
