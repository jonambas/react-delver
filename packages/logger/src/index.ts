import chalk from 'chalk';

process.env.FORCE_COLOR = 'true';
const isTest = process.env.NODE_ENV === 'test';
const prefix = `${chalk.gray('delver →')}`;

/**
 * Console logs a red error message
 */
export function logError(message: string) {
  console.log(`${prefix} ${chalk.red.bold(message)}`);
}

/**
 * Console logs a blue message
 */
export function logInfo(message: string) {
  if (!isTest) {
    console.log(`${prefix} ${chalk.blueBright(message)}`);
  }
}

/**
 * Console logs a muted gray message
 */
export function logMuted(message: string) {
  if (!isTest) {
    console.log(`${prefix} ${chalk.gray(message)}`);
  }
}

/**
 * Console logs a green success message
 */
export function logSuccess(message: string) {
  if (!isTest) {
    console.log(`${prefix} ${chalk.green(message)}`);
  }
}
