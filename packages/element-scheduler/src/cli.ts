import { Scheduler } from './Scheduler'
import { mustCompileFile, ElementOptions, EvaluatedScript } from '@flood/element-core'
import Spinnies from 'spinnies'

export async function runCommandLine(opts: ElementOptions): Promise<void> {
	const { testScript, runEnv, testSettingOverrides, headless, browser } = opts

	const evaluateScript = new EvaluatedScript(runEnv, await mustCompileFile(testScript))

	const runner = new Scheduler(runEnv, {
		...evaluateScript.settings,
		...testSettingOverrides,
		headless: headless,
		browser: browser || evaluateScript.settings.browser,
		verbose: opts.verbose,
	})

	const spinnies = new Spinnies()
	runner.setSpinnies(spinnies)

	spinnies.add('initializing', { text: 'Initializing users ...' })

	await runner.run(testScript)
	await runner.stop()
}
