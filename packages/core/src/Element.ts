import { launch } from './driver/Puppeteer'
import { IRunner, Runner, PersistentRunner } from './Runner'
import { mustCompileFile } from './TestScript'
import { TestScriptOptions } from './TestScriptOptions'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { ElementOptions, ElementRunArguments, normalizeElementOptions } from './ElementOption'

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
		console.log('Element exited with error')
		console.error(err)
	}
}

export async function runCommandLine(args: ElementRunArguments): Promise<void> {
	// if (args.verbose) {
	// } else {
	// }
	if (args.testFiles) {
		console.info(
			'The following test scripts that matched the testPathMatch pattern are going to be executed:',
		)
		for (const file of args.testFiles) {
			const arg: ElementRunArguments = {
				...args,
				file,
			}
			const opts = normalizeElementOptions(arg)
			await runSingleTestScript(opts)
		}
		console.info('Test running with the config file has finished')
	} else {
		const opts = normalizeElementOptions(args)
		await runSingleTestScript(opts)
	}
	process.exit(0)
}
