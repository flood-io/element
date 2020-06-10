import { CommandModule } from 'yargs'

import { getProject, isAuthenticated } from '../../utils/flood'

import lsCmd from './project/ls'

export default {
	command: 'project <command>',
	describe: 'View/select project(s) to run floods into',
	builder(yargs) {
		return yargs
			.command({
				command: '$0',
				describe: 'See the currently selected project',
				async handler() {
					console.log(`Using "${getProject().name}" on Flood`)
				},
			})
			.command(lsCmd)
			.check(() => {
				return isAuthenticated()
			})
	},
	handler() {
		return
	},
} as CommandModule
