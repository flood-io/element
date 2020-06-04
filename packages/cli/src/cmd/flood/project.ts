import { CommandModule } from 'yargs'

import { getProject, isAuthenticated, usingProject } from '../../utils/flood'

import lsCmd from './project/ls'

export default {
	command: 'project <command>',
	describe: false,
	builder(yargs) {
		return yargs
			.command({
				command: '$0',
				describe: 'See the currently selected project',
				async handler() {
					console.log(`Using "${getProject()}" on Flood`)
				},
			})
			.command(lsCmd)
			.check(() => {
				return isAuthenticated() && usingProject()
			})
	},
	handler() {
		return
	},
} as CommandModule
