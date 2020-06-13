import { Argv, Arguments, CommandModule } from 'yargs'

import { getProjects, setProject, isAuthenticated } from '../../utils/flood'

interface UseArguments extends Arguments {
	project: string
}

const cmd: CommandModule = {
	command: 'use <project>',
	describe: 'Select a project (by id or name) to run floods into',

	async handler(args: UseArguments) {
		const { project } = args

		const projects = await getProjects()

		if (
			projects.some(p => {
				if (p.id === project || p.name === project) {
					setProject({ id: p.id, name: p.name })
					return true
				}
				return false
			})
		) {
			console.log(`Using "${name}"`)
		} else {
			throw `No project found with id or name "${name}". Please check and try again`
		}
	},
	builder(yargs: Argv): Argv {
		return yargs
			.positional('project', {
				describe: 'Project id or name from Flood',
			})
			.check(() => isAuthenticated())
	},
}

export default cmd
