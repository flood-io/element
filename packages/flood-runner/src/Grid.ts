import { runSingleTestScript, ElementOptions, TestObserver } from '@flood/element-api'
import { Context, TimingObserver, BROWSER_TYPE } from '@flood/element-core'
import { TracingObserver } from './test-observers/Tracing'
import { initConfig } from './initConfig'
import { startConcurrencyTicker } from './tickerInterval'
import { initInfluxReporter } from './initInfluxReporter'

export async function run(file: string): Promise<void> {
	const gridConfig = initConfig()
	const influxReporter = initInfluxReporter(gridConfig)

	const testObserverFactory = (innerObserver: TestObserver) => {
		const testObserverContext = new Context()
		return new TimingObserver(
			testObserverContext,
			new TracingObserver(testObserverContext, innerObserver),
		)
	}

	const opts: ElementOptions = {
		testScript: file,
		strictCompilation: false, // TODO make this configurable
		reporter: influxReporter,
		runEnv: gridConfig,
		verbose: false,
		headless: true,
		devtools: false,
		browserType: BROWSER_TYPE.CHROME,
		sandbox: false,
		testSettingOverrides: {},
		testObserverFactory,
		persistentRunner: false,
		failStatusCode: 1,
	}

	if (gridConfig.testDuration !== undefined) {
		opts.testSettingOverrides.duration = gridConfig.testDuration
	}

	if (gridConfig.testIterations !== undefined) {
		opts.testSettingOverrides.loopCount = gridConfig.testIterations
	}

	startConcurrencyTicker(influxReporter)

	return runSingleTestScript(opts)
}
