import { CommandModule } from 'yargs'

import { fetchProjects } from '../../../utils/flood'

const cmd: CommandModule = {
	command: 'ls',
	describe: 'List all projects of authenticated account',

	async handler() {
		const projects = await fetchProjects()

		if (projects.length > 0) {
			console.table(projects, ['id', 'name'])
		} else {
			console.log("There're no projects on Flood. Please visit https://app.flood.io to create one")
		}
	},
}

export default cmd
