import { CommandModule } from 'yargs'

import { getProject, isAuthenticated } from '../../utils/flood'

import lsCmd from './project/ls'

const defaultCmd: CommandModule = {
	command: '$0',
	describe: 'See the currently selected project',

	handler() {
		console.log(`Using "${getProject().name}" on Flood`)
	},
	builder(yargs) {
		return yargs.check(() => {
			return getProject()
		})
	},
}

export default {
	command: 'project <command>',
	describe: 'View/select project(s) to run floods into',
	builder(yargs) {
		return yargs
			.command(defaultCmd)
			.command(lsCmd)
			.check(() => isAuthenticated())
	},
	handler() {
		return
	},
} as CommandModule
