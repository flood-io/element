import { CommandModule } from 'yargs'
import startCmd from './agent/start'

export default {
	command: 'agent <command>',
	describe: 'Flood Agent commands',
	builder(yargs) {
		return yargs.command(startCmd)
	},
	handler() {
		return
	},
} as CommandModule
