import { runCommandLine, ElementOptions, TestObserver } from '@flood/element-api'
import { Context } from './test-observers/Context'
import { TimingObserver } from './test-observers/Timing'
import { TracingObserver } from './test-observers/Tracing'
import { initConfig } from './initConfig'
import { startConcurrencyTicker } from './tickerInterval'
import { initInfluxReporter } from './initInfluxReporter'

export async function run(file: string): Promise<number> {
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
		logger: gridConfig.logger,
		testScript: file,
		strictCompilation: false, // TODO make this configurable
		reporter: influxReporter,
		runEnv: gridConfig,
		verbose: false,
		headless: true,
		devtools: false,
		chromeVersion: undefined, // allow user to specify in the script, default to puppeteer bundled
		sandbox: false,
		testSettingOverrides: {},
		testObserverFactory,
		persistentRunner: false,
	}

	if (gridConfig.testDuration !== undefined) {
		opts.testSettingOverrides.duration = gridConfig.testDuration
	}

	if (gridConfig.testIterations !== undefined) {
		opts.testSettingOverrides.loopCount = gridConfig.testIterations
	}

	startConcurrencyTicker(influxReporter, gridConfig.logger)

	return runCommandLine(opts)
}
