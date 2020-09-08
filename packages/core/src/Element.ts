import { launch } from './driver/Playwright'
import { IRunner, Runner, PersistentRunner } from './Runner'
import { mustCompileFile } from './TestScript'
import { TestScriptOptions } from './TestScriptOptions'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { ElementOptions, ElementRunArguments, normalizeElementOptions } from './ElementOption'
import { CustomConsole, ReportCache } from '@flood/element-report'
import chalk from 'chalk'
import { EventEmitter } from 'events'

export async function runSingleTestScript(opts: ElementOptions): Promise<void> {
	const { testScript, clientFactory } = opts

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
		opts.testSettingOverrides,
		{
			headless: opts.headless,
			devtools: opts.devtools,
			sandbox: opts.sandbox,
			browserType: opts.browserType,
			debug: opts.verbose,
		},
		opts.testObserverFactory,
		opts.cache,
	)

	const installSignalHandlers = true

	if (installSignalHandlers) {
		process.on('SIGINT', async () => {
			await runner.stop()
		})

		process.once('SIGUSR2', async () => {
			await runner.stop()
			process.kill(process.pid, 'SIGUSR2')
		})
	}

	const testScriptOptions: TestScriptOptions = {
		stricterTypeChecking: opts.strictCompilation,
		traceResolution: false,
	}

	const testScriptFactory = async (): Promise<EvaluatedScript> => {
		return new EvaluatedScript(opts.runEnv, await mustCompileFile(testScript, testScriptOptions))
	}
	try {
		await runner.run(testScriptFactory)
	} catch {}
}

export async function runCommandLine(args: ElementRunArguments): Promise<void> {
	const myEmitter = new EventEmitter()
	const cache = new ReportCache(myEmitter)
	global.console = new CustomConsole(process.stdout, process.stderr, myEmitter)
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
			const opts = normalizeElementOptions(arg, cache)
			await runSingleTestScript(opts)
			console.groupEnd()
		}
		console.log(chalk.grey('Test running with the config file has finished'))
	} else {
		const { file } = args
		const fileTitle = chalk.grey(`${file} (1 of 1)`)
		console.group(chalk('Running', fileTitle))
		const opts = normalizeElementOptions(args, cache)
		await runSingleTestScript(opts)
		console.groupEnd()
	}
	myEmitter.removeAllListeners('add')
	myEmitter.removeAllListeners('update')
	cache.resetCache()
	process.exit(0)
}
