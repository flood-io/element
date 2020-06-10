import { Argv, Arguments, CommandModule } from 'yargs'
import { checkFile, RunCommonArguments, runTestScript, readConfigFile } from '../common'
import glob from 'glob'

interface RunConfigurationArguments extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'config [file]',
	describe: 'Run test scripts locally with configuration',

	async handler(args: RunConfigurationArguments) {
		const { options, paths } = await readConfigFile(args.file)

		if (!paths.testPathMatch || !paths.testPathMatch.length) {
			throw Error('Found no test scripts matching testPathMatch pattern')
		}
		const files: string[] = []
		try {
			files.push(
				...(paths.testPathMatch.reduce(
					(arr: string[], item: string) => arr.concat(glob.sync(item)),
					[],
				) as []),
			)
			if (!files.length) {
				throw Error('Found no test scripts matching testPathMatch pattern')
			}
		} catch {
			throw Error('Found no test scripts matching testPathMatch pattern')
		}
		console.info(
			'The following test scripts that matched the testPathMatch pattern are going to be executed:',
		)
		for (const file of files.sort()) {
			const arg: RunCommonArguments = {
				...options,
				...paths,
				file,
			}
			await runTestScript(arg)
		}
		console.info('Test running with the config file has finished')
		process.exit(0)
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
				const fileErr = checkFile(file as string, 'Configuration file')
				if (fileErr) return fileErr
				return true
			})
	},
}

export default cmd
