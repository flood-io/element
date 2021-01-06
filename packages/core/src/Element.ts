import { launch } from './driver/Playwright'
import { IRunner, Runner, PersistentRunner } from './Runner'
import { mustCompileFile } from './TestScript'
import { TestScriptOptions } from './TestScriptOptions'
import { EvaluatedScript } from './runtime/EvaluatedScript'
import { ElementOptions, ElementRunArguments, normalizeElementOptions } from './ElementOption'
import { CustomConsole, IterationResult, TestResult } from '@flood/element-report'
import chalk from 'chalk'
import { ElementResult } from './ElementResult'
import Spinnies from 'spinnies'

export async function runSingleTestScript(opts: ElementOptions): Promise<IterationResult[]> {
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
		opts.testSettings,
		opts.testSettingOverrides,
		{
			headless: opts.headless,
			devtools: opts.devtools,
			sandbox: opts.sandbox,
			browser: opts.browser,
			debug: opts.verbose,
		},
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
	const elementResult = new ElementResult()
	const spinnies = new Spinnies()
	global.console = new CustomConsole(process.stdout, process.stderr, spinnies)

	const prepareAndRunTestScript = async (
		fileTitle: string,
		args: ElementRunArguments,
		elementResult: ElementResult,
		isConfig: boolean,
	) => {
		spinnies.add('Running', {
			text: chalk('Running', fileTitle),
			status: 'non-spinnable',
			indent: 0,
		})
		const opts = normalizeElementOptions(args, spinnies)
		elementResult.addExecutionInfo(opts, isConfig)

		try {
			const iterationResult = await runSingleTestScript(opts)
			elementResult.addTestScript(args.file, iterationResult)
		} catch (err) {
			elementResult.addScriptWithError({ name: args.file, error: err.message })
		}
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
			await prepareAndRunTestScript(fileTitle, arg, elementResult, true)
		}
	}

	if (args.notExistingFiles) {
		args.notExistingFiles.forEach(name =>
			elementResult.addScriptWithError({ name, error: "Test script(s) couldn't be found" }),
		)
	}

	return elementResult.getResult()
}
