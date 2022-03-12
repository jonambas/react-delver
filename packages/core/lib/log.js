import chalk from 'chalk';

const prefix = `${chalk.gray('delve →')}`;

export function logError(message) {
  console.log(`${prefix} ${chalk.red.bold(message)}`);
}

export function logInfo(message) {
  console.log(`${prefix} ${chalk.blueBright(message)}`);
}

export function logMuted(message) {
  console.log(`${prefix} ${chalk.gray(message)}`);
}

export function logSuccess(message) {
  console.log(`${prefix} ${chalk.green(message)}`);
}
