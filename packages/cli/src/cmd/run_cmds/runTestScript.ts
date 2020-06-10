import { Argv, CommandModule } from 'yargs'
import { checkFile, RunCommonArguments, runTestScript } from '../common'

const cmd: CommandModule = {
	command: '$0 <file> [options]',
	describe: 'Run a test script locally',

	async handler(args: RunCommonArguments) {
		await runTestScript(args)
		process.exit(0)
	},
	builder(yargs: Argv): Argv {
		return yargs
			.option('chrome', {
				group: 'Browser:',
				describe:
					'Specify which version of Google Chrome to use. Default: use the puppeteer bundled version. stable: ',
				coerce: chrome => {
					// [not specified] => undefined => use test script value
					// --chrome => override to 'stable'
					// --chrome string => override to <string>
					let chromeVersion: string | undefined
					if (typeof chrome === 'boolean') {
						if (chrome) {
							chromeVersion = 'stable'
						}
					} else {
						chromeVersion = chrome
					}

					return chromeVersion
				},
			})
			.option('no-headless', {
				group: 'Browser:',
				describe:
					'Run in non-headless mode so that you can see what the browser is doing as it runs the test',
			})
			.option('devtools', {
				group: 'Browser:',
				describe: 'Run in non-headless mode and also open devtools',
			})
			.option('no-sandbox', {
				group: 'Browser:',
				describe: 'Disable the chrome sandbox - advanced option, mostly necessary on linux',
			})
			.option('watch', {
				group: 'Running the test script:',
				describe: 'Watch <file> and rerun the test when it changes.',
			})
			.option('fast-forward', {
				group: 'Running the test script:',
				alias: 'ff',
				describe:
					'Run the script in fast-forward: override the actionDelay and stepDelay settings to 1 second in the test script.',
				conflicts: 'slow-mo',
				type: 'boolean',
			})
			.options('slow-mo', {
				group: 'Running the test script:',
				describe:
					'Run the script in slow-motion: Increase the actionDelay and stepDelay settings in the test script to 10 seconds.',
				conflicts: 'fast-forward',
				type: 'boolean',
			})
			.options('step-delay', {
				group: 'Running the test script:',
				describe: 'Override stepDelay test script setting',
				type: 'number',
			})
			.options('action-delay', {
				group: 'Running the test script:',
				describe: 'Override actionDelay test script setting',
				type: 'number',
			})
			.option('loop-count', {
				group: 'Running the test script:',
				describe:
					'Override the loopCount setting in the test script. This is normally overridden to 1 when running via the cli.',
				type: 'number',
			})
			.option('strict', {
				group: 'Running the test script:',
				describe: 'Compile the script in strict mode. This can be helpful in diagnosing problems.',
			})
			.option('work-root', {
				group: 'Paths:',
				describe:
					'Specify a custom work root. (Default: a directory named after your test script, and at the same location)',
			})
			.option('test-data-root', {
				group: 'Paths:',
				describe:
					'Specify a custom path to find test data files. (Default: the same directory as the test script)',
			})
			.option('verbose', {
				describe: 'Verbose mode',
			})
			.option('fail-status-code', {
				describe: 'Exit code when the test fails',
				type: 'number',
				default: 1,
			})
			.positional('file', {
				describe: 'the test script to run',
			})
			.check(({ file }) => {
				const fileErr = checkFile(file as string)
				if (fileErr) return fileErr

				return true
			})
	},
}

export default cmd
