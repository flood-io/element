import { ElementConfig } from '@flood/element-core/src/ElementOption'
import { Argv, Arguments, CommandModule } from 'yargs'
import { checkFile } from './common'
import {
	ElementRunArguments,
	runCommandLine as runSingleUser,
	normalizeElementOptions,
	ElementOptions,
	checkBrowserType,
} from '@flood/element-core'
import { runCommandLine as runMultipleUser } from '@flood/element-scheduler'
import chalk from 'chalk'
import { EventEmitter } from 'events'
import { ReportCache } from '@flood/element-report'
import { getFilesPattern, readConfigFile } from '../utils/run'
import YoEnv from 'yeoman-environment'
import ReportGenerator from '../generator/test-report'
import sanitize from 'sanitize-filename'
import { resolve, dirname, basename, extname, join } from 'path'
import webpack, { Configuration } from 'webpack'
import CssExtractPlugin from 'mini-css-extract-plugin'

interface RunCommonArguments extends Arguments, ElementRunArguments {}

async function getArgsFromConfig(args: RunCommonArguments): Promise<RunCommonArguments> {
	const { file, configFile, _, $0, mu } = args
	const fileErr = checkFile(configFile, 'Configuration file')
	let testFiles: string[]
	let notExistingFiles: string[]

	if (fileErr) {
		if (!file) throw fileErr
		return { ...args, testFiles: [file], notExistingFiles: [] }
	}

	const configFileFromArgs: ElementConfig = await readConfigFile(configFile)
	const { options, paths, testSettings } = configFileFromArgs

	if (file) {
		testFiles = [file]
		notExistingFiles = []
	} else {
		if (!paths.testPathMatch || !paths.testPathMatch.length) {
			throw Error('Found no test scripts matching testPathMatch pattern')
		}
		const filesPattern = getFilesPattern(paths.testPathMatch)
		testFiles = filesPattern.files.sort()
		notExistingFiles = filesPattern.notExistingFiles.sort()
	}

	return {
		...options,
		testSettings,
		testFiles,
		notExistingFiles,
		runArgs: {
			...args,
		},
		_,
		$0,
		file,
		'fail-status-code': args['fail-status-code'],
		configFile,
		mu,
	}
}

const cmd: CommandModule = {
	command: 'run [file] [options]',
	describe: 'Run [a test script| test scripts with configuration] locally',

	async handler(args: RunCommonArguments): Promise<void> {
		const { file, mu, configFile } = args
		if (mu) {
			if (!file) {
				console.log(
					chalk.redBright(
						`The mode 'running the test with multiple test scripts' does not support running with multiple users`,
					),
				)
				process.exit(0)
			}
			const myEmitter = new EventEmitter()
			const cache = new ReportCache(myEmitter)
			const opts: ElementOptions = normalizeElementOptions(args, cache)
			await runMultipleUser(opts)
			process.exit(0)
		}
		const configurationArgs = await getArgsFromConfig(args)
		if (configurationArgs.fastForward && configurationArgs.slowMo) {
			console.error(chalk.redBright(`Arguments fast-forward and slow-mo are mutually exclusive`))
			process.exit(0)
		}

		if (configurationArgs.browser || configurationArgs.runArgs?.browser) {
			const browser = configurationArgs.browser ?? configurationArgs.runArgs?.browser
			checkBrowserType(browser)
		}

		const result = await runSingleUser(configurationArgs)

		if (args.export) {
			let root: string
			if (file) {
				const fileName = basename(file, extname(file))
				root = join(dirname(file), 'reports', fileName)
			} else {
				root = join(dirname(configFile), 'reports')
			}

			const reportRoot = '../../templates/report/'
			const webpackConfig: Configuration = {
				entry: resolve(__dirname, reportRoot, 'script.ts'),
				mode: 'production',
				target: 'web',
				output: {
					path: resolve(__dirname, reportRoot),
					filename: './script.js',
					globalObject: 'this',
					libraryTarget: 'umd',
				},
				resolve: {
					extensions: ['.ts', '.scss'],
				},
				module: {
					rules: [
						{
							test: /\.ts$/,
							loader: require.resolve('ts-loader'),
							options: {
								onlyCompileBundledFiles: true,
								compilerOptions: {
									module: 'commonjs',
									target: 'es5',
								},
							},
						},
						{
							test: /\.scss$/i,
							use: [CssExtractPlugin.loader, 'css-loader', 'sass-loader'],
						},
					],
				},
				plugins: [new CssExtractPlugin({ filename: 'styles.css' })],
			}

			webpack(webpackConfig).run(error => {
				if (error) {
					console.log(error)
					return
				}
				const dateString = sanitize(new Date().toISOString())
				const reportPath = resolve(root, dateString)
				const env = YoEnv.createEnv()

				env.registerStub(ReportGenerator as any, 'report-generator')
				env.run(
					['report-generator'],
					{
						data: JSON.stringify(result, null, '\t'),
						dir: reportPath,
						force: true,
					},
					() => {
						console.log(`Your report has been saved in ${reportPath}`)
					},
				)
			})
		}
	},
	builder(yargs: Argv): Argv {
		return yargs
			.option('browser', {
				group: 'Browser',
				type: 'string',
				describe: `Sets the browser type used to run the test, using one of the 3 bundled browsers: 'chromium', 'firefox' and 'webkit'.`,
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
				type: 'string',
			})
			.options('action-delay', {
				group: 'Running the test script:',
				describe: 'Override actionDelay test script setting',
				type: 'string',
			})
			.option('loop-count', {
				group: 'Running the test script:',
				describe: 'Override the loopCount setting in the test script',
				type: 'number',
			})
			.option('work-root', {
				group: 'Paths:',
				describe:
					'Specify a custom work root to save the test results. (Default: a directory named after your test script, under /tmp/element-results of your project folder)',
			})
			.option('test-data-root', {
				group: 'Paths:',
				describe:
					'Specify a custom path to find test data files. (Default: the same directory as the test script)',
			})
			.option('executable-path', {
				group: 'Paths',
				type: 'string',
				describe:
					'Path to the installation folder of a custom browser based on Chromium. If set, Element will ignore the browser setting and use this custom browser instead.',
			})
			.option('downloads-path', {
				group: 'Paths',
				type: 'string',
				describe:
					'If specified, accepted downloads are downloaded into this directory. Otherwise, a temporary directory is created and is deleted when browser is closed.',
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
				coerce: file => {
					const fileErr = checkFile(file as string)
					if (fileErr) throw fileErr
					return file
				},
			})
			.option('config-file', {
				describe: 'Run test scripts with configuration',
				type: 'string',
				default: 'element.config.js',
			})
			.option('mu', {
				describe: 'Run test scripts with multiple users',
				type: 'boolean',
				default: false,
			})
			.option('export', {
				describe: 'Export a HTML report after the test finished running',
				type: 'boolean',
			})
			.option('show-screenshot', {
				describe: 'show screenshot in the terminal (iTerm 2 only)',
				type: 'boolean',
			})
			.fail((msg, err) => {
				if (err) console.error(chalk.redBright(err.message))
				if (msg) console.error(chalk.redBright(msg))
				process.exit(1)
			})
	},
}

export default cmd
