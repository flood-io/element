import chalk from 'chalk'

export const error = (...messages: string[]) => chalk`{red > Error!} ${messages.join('\n')}`
