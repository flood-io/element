import { main } from './src/Grid'
import { runUntilExit } from '@flood/element'

runUntilExit(() => main(process.argv))
