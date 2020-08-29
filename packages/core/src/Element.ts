import { launch } from './driver/Puppeteer'
import { IRunner, Runner, PersistentRunner } from './Runner'
import { mustCompileFile } from './TestScript'
import { TestScriptOptions } from './TestScriptOptions'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { ElementOptions, ElementRunArguments, normalizeElementOptions } from './ElementOption'
import { CustomConsole } from '@flood/element-report'
import chalk from 'chalk'

async function runSingleTestScript(opts: ElementOptions): Promise<void> {
	const { logger, testScript, clientFactory } = opts

	// TODO proper types for args
	let runnerClass: { new (...args: any[]): IRunner }
	if (opts.persistentRunner) {
		runnerClass = PersistentRunner
	} else {
		runnerClass = Runner
	}

	const runner = new runnerClass(
		clientFactory || launch,
		opts.testCommander,
		opts.reporter,
		logger,
		opts.testSettingOverrides,
		{
			headless: opts.headless,
			devtools: opts.devtools,
			sandbox: opts.sandbox,
			chromeVersion: opts.chromeVersion,
			debug: opts.verbose,
		},
		opts.testObserverFactory,
	)

	const installSignalHandlers = true

	if (installSignalHandlers) {
		process.on('SIGINT', async () => {
			logger.debug('Received SIGINT')
			await runner.stop()
		})

		process.once('SIGUSR2', async () => {
			// Usually received by nodemon on file change
			logger.debug('Received SIGUSR2')
			await runner.stop()
			process.kill(process.pid, 'SIGUSR2')
		})
	}

	logger.debug(`Loading test script: ${testScript}`)

	const testScriptOptions: TestScriptOptions = {
		stricterTypeChecking: opts.strictCompilation,
		traceResolution: false,
	}

	const testScriptFactory = async (): Promise<EvaluatedScript> => {
		return new EvaluatedScript(opts.runEnv, await mustCompileFile(testScript, testScriptOptions))
	}
	try {
		await runner.run(testScriptFactory)
	} catch (err) {
		throw Error(err)
	}
}

export async function runCommandLine(args: ElementRunArguments): Promise<void> {
	global.console = new CustomConsole(process.stdout, process.stderr)
	if (args.testFiles) {
		console.log(
			chalk.grey(
				'The following test scripts that matched the testPathMatch pattern are going to be executed:',
			),
		)
		let order = 0
		const numberOfFile = args.testFiles.length
		for (const file of args.testFiles) {
			const arg: ElementRunArguments = {
				...args,
				file,
			}
			if (order >= 1) {
				console.log(
					chalk.grey('------------------------------------------------------------------'),
				)
			}
			order++
			const fileTitle = chalk.grey(`${file} (${order} of ${numberOfFile})`)
			console.group(chalk('Running', fileTitle))
			const opts = normalizeElementOptions(arg)
			await runSingleTestScript(opts)
			console.groupEnd()
		}
		console.log(chalk.grey('Test running with the config file has finished'))
	} else {
		const fileTitle = chalk.grey(`${args.file} (1 of 1)`)
		console.group(chalk('Running', fileTitle))
		const opts = normalizeElementOptions(args)
		await runSingleTestScript(opts)
		console.groupEnd()
	}
	process.exit(0)
}
