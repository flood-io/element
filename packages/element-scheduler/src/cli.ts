import { Scheduler } from './Scheduler'
import { mustCompileFile, ElementOptions, EvaluatedScript } from '@flood/element-core'
import Spinnies from 'spinnies'

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	const { testScript, runEnv, testSettingOverrides, headless, browserType } = opts

	const evaluateScript = new EvaluatedScript(runEnv, await mustCompileFile(testScript))

	const runner = new Scheduler(runEnv, {
		...evaluateScript.settings,
		...testSettingOverrides,
		headless: headless,
		browserType: browserType || evaluateScript.settings.browserType,
		verbose: opts.verbose,
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
	const spinnies = new Spinnies()
	runner.setSpinnies(spinnies)

	spinnies.add('initializing', { text: 'Initializing user ...' })

	await runner.run(testScript)
	await runner.stop()
}
