import { Scheduler } from './Scheduler'
import { mustCompileFile, ElementOptions, EvaluatedScript } from '@flood/element-core'

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	const { logger, testScript } = opts

	const evaluateScript = new EvaluatedScript(opts.runEnv, await mustCompileFile(testScript))

	const runner = new Scheduler(opts.runEnv, {
		...evaluateScript.settings,
		...opts.testSettingOverrides,
		headless: opts.headless,
		browserType: opts.browserType || evaluateScript.settings.browserType,
	})

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
