import { TestSettings, ResponseTiming, ConsoleMethod } from '../../index'
import CustomDeviceDescriptors from '../utils/CustomDeviceDescriptors'

// Waits is seconds
export const DEFAULT_STEP_WAIT_SECONDS = 5
export const DEFAULT_ACTION_WAIT_SECONDS = 0.5

export interface ConcreteTestSettings extends TestSettings {
	duration: number
	loopCount: number
	actionDelay: number
	stepDelay: number
	screenshotOnFailure: boolean
	clearCookies: boolean
	clearCache: boolean
	waitTimeout: number
	responseTimeMeasurement: ResponseTiming
	consoleFilter: ConsoleMethod[]
	userAgent: string
	device: string
	ignoreHTTPSErrors: boolean
}

export const DEFAULT_SETTINGS: ConcreteTestSettings = {
	duration: -1,
	loopCount: Infinity,
	actionDelay: 2,
	stepDelay: 6,
	screenshotOnFailure: true,
	clearCookies: true,
	clearCache: false,
	waitTimeout: 30,
	responseTimeMeasurement: 'step',
	consoleFilter: [],
	userAgent: CustomDeviceDescriptors['Chrome Desktop Large'].userAgent,
	device: 'Chrome Desktop Large',
	ignoreHTTPSErrors: false,
}

export function normalizeSettings(settings: TestSettings): TestSettings {
	// Convert user inputted seconds to milliseconds
	if (typeof settings.waitTimeout === 'number' && settings.waitTimeout > 1e3) {
		settings.waitTimeout = settings.waitTimeout / 1e3
	} else if (Number(settings.waitTimeout) === 0) {
		settings.waitTimeout = 30
	}

	// Ensure action delay is stored in seconds (assuming any value greater than 60 seconds would be ms)
	if (typeof settings.actionDelay === 'number' && settings.actionDelay > 60) {
		settings.actionDelay = settings.actionDelay / 1e3
	} else if (Number(settings.actionDelay) === 0) {
		settings.actionDelay = DEFAULT_ACTION_WAIT_SECONDS
	}

	// Ensure step delay is stored in seconds
	if (typeof settings.stepDelay === 'number' && settings.stepDelay > 60) {
		settings.stepDelay = settings.stepDelay / 1e3
	} else if (Number(settings.stepDelay) === 0) {
		settings.actionDelay = DEFAULT_STEP_WAIT_SECONDS
	}

	return settings
}
