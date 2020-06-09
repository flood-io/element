import { Argv, Arguments, CommandModule } from 'yargs'
import { join } from 'path'
import { checkFile, RunCommonArguments, runTestScript } from '../common'
import glob from 'glob'

interface RunConfigurationArguments extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'config [file]',
	describe: 'Run test scripts locally with configuration',

	async handler(args: RunConfigurationArguments) {
		const rootPath = process.cwd()
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { options, paths } = require(join(rootPath, args.file))

		if (!paths.testPathMatch || !paths.testPathMatch.length) {
			return new Error(`Please provide values of testPathMatch in ${args.file}`)
		}

		const files = paths.testPathMatch.reduce((arr, item) => arr.concat(glob.sync(item)), [])
		if (!files.length) {
			return new Error(
				`Can not find any test script to run with configuration. Please check values of testPathMatch in ${args.configFile} file again`,
			)
		}

		console.log(`Preparing to run test scripts: ${files} ...`)
		for (const file of files) {
			try {
				const arg: RunCommonArguments = {
					...options,
					...paths,
					file: file,
				}
				await runTestScript(arg)
			} catch {
				console.log(`Run test script ${file} failed`)
			}
		}
		console.log('Completely run test scripts with configuration')
	},
	builder(yargs: Argv): Argv {
		return yargs
			.option('file', {
				describe: 'run with configuration',
				type: 'string',
				default: 'element.config.js',
			})
			.option('verbose', {
				describe: 'Verbose mode',
			})
			.check(({ file }) => {
				const fileErr = checkFile(file as string)
				if (fileErr) return fileErr
				return true
			})
	},
}

export default cmd
