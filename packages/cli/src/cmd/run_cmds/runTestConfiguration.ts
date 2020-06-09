import { Argv, Arguments, CommandModule } from 'yargs'
import { join } from 'path'
import { checkFile, RunCommonArguments, runTestScript } from '../common'

interface RunConfigurationArguments extends Arguments {
	configFile: string
}

const cmd: CommandModule = {
	command: 'config [options]',
	describe: 'Run test scripts locally with configuration',

	handler(args: RunConfigurationArguments) {
		const rootPath = process.cwd()
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { options, paths } = require(join(rootPath, args.configFile))

		if (!paths.testPathMatch || !paths.testPathMatch.length) {
			return new Error(`Please provide values of testPathMatch in ${args.configFile}`)
		}
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const glob = require('glob')
		const files = paths.testPathMatch.reduce((arr, item) => arr.concat(glob.sync(item)), [])
		if (!files.length) {
			return new Error(
				`Can not find any test script to run with configuration. Please check values of testPathMatch in ${args.configFile} file again`,
			)
		}

		console.log(`Preparing to run test scripts: ${files}`)
		files.forEach(file => {
			const arg: RunCommonArguments = {
				...options,
				...paths,
				file: file,
			}
			runTestScript(arg)
		})
	},
	builder(yargs: Argv): Argv {
		return yargs
			.option('config-file', {
				describe: 'run with configuration',
				type: 'string',
				default: 'element.config.js',
			})
			.option('verbose', {
				describe: 'Verbose mode',
			})
			.check(({ configFile }) => {
				const fileErr = checkFile(configFile as string)
				if (fileErr) return fileErr
				return true
			})
	},
}

export default cmd
