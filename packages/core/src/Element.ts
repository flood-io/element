import { ConcreteLaunchOptions, launch } from './driver/Playwright'
import { IRunner, Runner, PersistentRunner } from './Runner'
import { mustCompileFile } from './TestScript'
import { TestScriptOptions } from './TestScriptOptions'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { ElementOptions, ElementRunArguments, normalizeElementOptions } from './ElementOption'
import { CustomConsole, IterationResult, ReportCache, TestResult } from '@flood/element-report'
import chalk from 'chalk'
import { EventEmitter } from 'events'
import { ElementResult } from './ElementResult'

export async function runSingleTestScript(opts: ElementOptions): Promise<IterationResult[]> {
	const {
		testScript,
		clientFactory,
		headless,
		devtools,
		sandbox,
		verbose,
		browser,
		executablePath,
		downloadsPath,
	} = opts
	const browserTypes = ['chromium', 'firefox', 'webkit']

	// TODO proper types for args
	let runnerClass: { new (...args: any[]): IRunner }
	if (opts.persistentRunner) {
		runnerClass = PersistentRunner
	} else {
		runnerClass = Runner
	}

	const launchOptionOverrides: Partial<ConcreteLaunchOptions> = {
		headless,
		devtools,
		sandbox,
		browser: browserTypes.includes(browser) ? browser : 'chromium',
		debug: verbose,
	}

	if (executablePath) {
		launchOptionOverrides.executablePath = executablePath
	}
	if (downloadsPath) {
		launchOptionOverrides.downloadsPath = downloadsPath
	}

	const runner = new runnerClass(
		clientFactory || launch,
		opts.testCommander,
		opts.reporter,
		opts.testSettings,
		opts.testSettingOverrides,
		launchOptionOverrides,
		opts.testObserverFactory,
	)

	process.on('SIGINT', async () => {
		await runner.stop()
	})

	process.once('SIGUSR2', async () => {
		await runner.stop()
	})

	const testScriptOptions: TestScriptOptions = {
		stricterTypeChecking: opts.strictCompilation,
		traceResolution: false,
	}

	const testScriptFactory = async (): Promise<EvaluatedScript> => {
		return new EvaluatedScript(opts.runEnv, await mustCompileFile(testScript, testScriptOptions))
	}
	await runner.run(testScriptFactory)
	return runner.getSummaryIterations()
}

export async function runCommandLine(args: ElementRunArguments): Promise<TestResult> {
	const myEmitter = new EventEmitter()
	const elementResult = new ElementResult()
	const cache = new ReportCache(myEmitter)
	global.console = new CustomConsole(process.stdout, process.stderr, myEmitter)

	const prepareAndRunTestScript = async (
		fileTitle: string,
		args: ElementRunArguments,
		cache: ReportCache,
		elementResult: ElementResult,
		isConfig: boolean,
	) => {
		console.group(chalk('Running', fileTitle))
		const opts = normalizeElementOptions(args, cache)
		elementResult.addExecutionInfo(opts, isConfig)

		try {
			const iterationResult = await runSingleTestScript(opts)
			elementResult.addTestScript(args.file, iterationResult)
		} catch (err) {
			elementResult.addScriptWithError({ name: args.file, error: err.message })
		}
		console.groupEnd()
		cache.resetCache()
	}

	if (args.testFiles) {
		if (!args.runArgs?.file) {
			console.log(
				chalk.grey(
					'The following test scripts that matched the testPathMatch pattern are going to be executed:',
				),
			)
		}
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
			await prepareAndRunTestScript(fileTitle, arg, cache, elementResult, true)
		}
		console.log(chalk.grey('Test running with the config file has finished'))
	}

	if (args.notExistingFiles) {
		args.notExistingFiles.forEach(name =>
			elementResult.addScriptWithError({ name, error: "Test script(s) couldn't be found" }),
		)
	}

	myEmitter.removeAllListeners('add')
	myEmitter.removeAllListeners('update')
	return elementResult.getResult()
}
