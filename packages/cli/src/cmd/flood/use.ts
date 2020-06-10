import { Argv, Arguments, CommandModule } from 'yargs'

import { getProjects, setProject, isAuthenticated } from '../../utils/flood'

interface UseArguments extends Arguments {
	name: string
}

const cmd: CommandModule = {
	command: 'use <name>',
	describe: 'Select a project (by name) to run floods',

	async handler(args: UseArguments) {
		const { name } = args

		const projects = await getProjects()

		if (
			projects.some(project => {
				if (project.name === name) {
					setProject({ id: project.id, name: project.name })
					return true
				}
				return false
			})
		) {
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
