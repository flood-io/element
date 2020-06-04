import { Argv, Arguments, CommandModule } from 'yargs'

import { Project, floodFetch, setProject, isAuthenticated } from '../../utils/flood'

interface UseArguments extends Arguments {
	name: string
}

const cmd: CommandModule = {
	command: 'use <name>',
	describe: 'Select a project (by name) to run floods',

	async handler(args: UseArguments) {
		const { name } = args

		const data = await floodFetch('https://api.flood.io/projects')
		const projects: Project[] = data._embedded.projects

		if (projects.some(project => project.name === name)) {
			setProject(name)
			console.log(`Using "${name}"`)
		} else {
			throw `No project found with name "${name}". Please check and try again`
		}
	},
	builder(yargs: Argv): Argv {
		return yargs
			.positional('name', {
				describe: 'Project name from Flood',
			})
			.check(() => {
				return isAuthenticated()
			})
	},
}

export default cmd
