import { Argv, Arguments, CommandModule } from 'yargs'
import chalk from 'chalk'

import { checkFile } from '../common'
import { configAvailable } from '../../utils/flood'

interface FloodRunArguments extends Arguments {
	file: string
	hosted: boolean
	virtualUsers: number
	duration: number
	rampup: number
}

const cmd: CommandModule = {
	command: 'run <file> [options]',
	describe: 'Run a flood from Element CLI',

	async handler(args: FloodRunArguments) {
		const { default: YoEnv } = await import('yeoman-environment')
		const { default: InfrastructureSelect } = args.hosted
			? await import('../../generator/flood/grids-select')
			: await import('../../generator/flood/regions-select')
		const env = YoEnv.createEnv()

		env.on('error', (err) => {
			console.error(chalk.redBright(err))
			process.exit(1)
		})
		env.registerStub(InfrastructureSelect as any, 'element/infrastructure-select')
		env.run('element/infrastructure-select', args, null as any)
	},
	builder(yargs: Argv): Argv {
		return yargs
			.option('hosted', {
				group: 'Flood options:',
				describe: 'Run a flood using hosted grid, otherwise using on-demand grid',
				type: 'boolean',
				default: false,
			})
			.option('virtual-users', {
				group: 'Flood options:',
				alias: 'vu',
				describe:
					'Number of users per region (when using on-demand grid) or per node (when using hosted grid)',
				type: 'number',
				default: 500,
			})
			.option('duration', {
				group: 'Flood options:',
				describe: 'Duration in minutes',
				type: 'number',
				default: 15,
			})
			.option('rampup', {
				group: 'Flood options:',
				describe: 'Ramp up in minutes',
				type: 'number',
				default: 0,
			})
			.positional('file', {
				describe: 'The test script to run',
			})
			.check(({ file }) => {
				const fileErr = checkFile(file as string)
				if (fileErr) return fileErr

				return true
			})
			.check(() => {
				return configAvailable()
			})
	},
}

export default cmd
