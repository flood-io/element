import chalk from 'chalk'

export default (text: string) => `${chalk.gray('`')}${chalk.cyan(text)}${chalk.gray('`')}`
