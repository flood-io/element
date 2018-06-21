import chalk from 'chalk'

// info('woot') === '> woot'
// info('woot', 'yay') === 'woot\nyay'
export const info = (...msgs) => `${chalk.gray('>')} ${msgs.join('\n')}`
