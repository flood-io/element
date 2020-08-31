import { Argv, Arguments, CommandModule } from 'yargs'
import { validateFile, webpackCompiler, getFilesPattern, readConfigFile } from '../utils/compile'

interface CommandArgs extends Arguments {
	file: string
}

const cmd: CommandModule = {
	command: 'compile [file]',
	describe: 'Compile external debs',

	async handler(args: CommandArgs) {
		try {
			if (args.file) {
				const result = await webpackCompiler(args.file)
				console.log(result.content)
			} else {
				const file = (args.configFile as string) || 'element.config.js'
				const { paths } = await readConfigFile(file)
				const files: string[] = getFilesPattern(paths.testPathMatch)
				for (const file of files) {
					const result = await webpackCompiler(file)
					console.log(result.content)
				}
			}
		} catch (err) {
			console.log(err)
		}
	},

	builder(yargs: Argv): Argv {
		return yargs
			.usage('usage: compile [file]')
			.option('file', {
				describe: 'entry file to run the test',
				coerce: file => validateFile(file),
			})
			.option('config-file', {
				describe: 'compile the test script in the config file',
				coerce: file => validateFile(file),
			})
	},
}

export default cmd
