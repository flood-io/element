import { Argv, Arguments, CommandModule } from 'yargs'

import { fetchProject, setProject, isAuthenticated } from '../../utils/flood'

interface UseArguments extends Arguments {
	project: string
}

const cmd: CommandModule = {
	command: 'use <project>',
	describe: 'Select a project (by id or name) to run floods into',

	async handler(args: UseArguments) {
		const { project } = args

		const p = await fetchProject(project)
		setProject(p)
		console.log(`Using "${p.name}"`)
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
