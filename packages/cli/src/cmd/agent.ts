import { CommandModule } from 'yargs'
import startCmd from './agent/start'

export default {
	command: 'agent <command>',
	describe: false,
	builder(yargs) {
		return yargs.command(startCmd)
	},
	handler() {
		return
	},
} as CommandModule
