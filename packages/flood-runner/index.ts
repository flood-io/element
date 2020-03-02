// eslint-disable-next-line import/no-unresolved
import { main } from './src/Grid'
import { runUntilExit } from '@flood/element-api'

runUntilExit(() => main(process.argv))
