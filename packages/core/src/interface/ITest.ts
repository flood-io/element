import Interceptor from '../network/Interceptor'
import { Browser } from '../runtime/Browser'
import { TestObserver } from '../runtime/test-observers/TestObserver'
import { Step } from '../runtime/Step'
import { CancellationToken } from '../utils/CancellationToken'
import { TestSettings } from '../runtime/Settings'
import { Looper } from '../Looper'
import { ScreenshotOptions } from '../page/types'
import { Hook } from '../runtime/StepLifeCycle'

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ITest {
	settings: TestSettings
	steps: Step[]
	hook: Hook
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
