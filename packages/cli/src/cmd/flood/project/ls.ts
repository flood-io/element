import { CommandModule } from 'yargs'

import { Project, floodFetch } from '../../../utils/flood'

const cmd: CommandModule = {
	command: 'ls',
	describe: 'List all projects of authenticated account',

	async handler() {
		const data = await floodFetch('https://api.flood.io/projects')
		const projects: Project[] = data._embedded.projects

		if (projects.length > 0) {
			projects.forEach(project => console.log(project.name))
		} else {
			console.log("There're no projects on Flood. Please visit https://app.flood.io to create one")
		}
	},
}

export default cmd
