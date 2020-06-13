import Interceptor from '../network/Interceptor'
import { Browser } from './Browser'
import { TestObserver } from './test-observers/Observer'
import { Step } from './Step'
import { CancellationToken } from '../utils/CancellationToken'
import { TestSettings } from './Settings'
import { Looper } from '../Looper'
import { ScreenshotOptions } from '../page/types'

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ITest {
	settings: TestSettings
	steps: Step[]
	runningBrowser?: Browser<Step> | null
	requestInterceptor: Interceptor
	iteration: number
	failed: boolean
	skipping: boolean
	stepNames: string[]
	currentURL: string
	cancel(): Promise<void>
	beforeRun(): Promise<void>
	run(iteration?: number): Promise<void>
	runWithCancellation(
		iteration: number,
		cancelToken: CancellationToken,
		looper: Looper,
	): Promise<void>
	runStep(
		testObserver: TestObserver,
		browser: Browser<Step>,
		step: Step,
		testDataRecord: any,
	): Promise<void>
	doStepDelay(): Promise<void>
	willRunCommand(testObserver: TestObserver, browser: Browser<Step>, command: string): Promise<void>
	takeScreenshot(options?: ScreenshotOptions): Promise<void>
	fetchScreenshots(): Promise<string[]>
}
