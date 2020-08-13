import { Schedular } from './Schedular'
import {
	mustCompileFile,
	ElementOptions,
	DEFAULT_SETTINGS,
	EvaluatedScript,
} from '@flood/element-core'

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	const { logger, testScript } = opts

	const compiledScript = new EvaluatedScript(opts.runEnv, await mustCompileFile(testScript))

	// const compiledTestScript = await mustCompileFile(testScript)
	const settings = DEFAULT_SETTINGS
	// settings.name = compiledTestScript.testName
	// settings.description = compiledTestScript.testDescription
	const runner = new Schedular(opts.runEnv, { ...settings, ...compiledScript.settings })

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

	console.debug(`Loading test script: ${testScript}`)

	await runner.run(testScript)
}
