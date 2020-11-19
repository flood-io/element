import { Scheduler } from './Scheduler'
import { mustCompileFile, ElementOptions, EvaluatedScript } from '@flood/element-core'

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	const { testScript, runEnv, testSettingOverrides, headless, browser } = opts

	const evaluateScript = new EvaluatedScript(runEnv, await mustCompileFile(testScript))

	const runner = new Scheduler(runEnv, {
		...evaluateScript.settings,
		...testSettingOverrides,
		headless: headless,
		browser: browser || evaluateScript.settings.browser,
	})

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

	console.debug(`Loading test script: ${testScript}`)

	await runner.run(testScript)
	await runner.stop()
}
