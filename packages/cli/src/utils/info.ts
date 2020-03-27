import chalk from 'chalk'
export const info = (...messages: string[]) => chalk`{blue > INFO} ${messages.join('\n')}`
