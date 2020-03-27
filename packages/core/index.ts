/**
 * @docPage Until
 */
export { Until } from './src/page/Until'

/**
 * @docPage Until
 */
export { Condition } from './src/page/Condition'

/**
 * @docPage Constants
 */
export { Device, Key, MouseButtons } from './src/page/Enums'

/**
 * @docPage By
 */
export { By } from './src/page/By'

/**
 * @docPage By
 */
export { Locator } from './src/page/types'

/**
 * @docPage ElementHandle
 */
export { ElementHandle } from './src/page/types'

/**
 * @docPage TargetLocator
 */
export { TargetLocator } from './src/page/types'

/**
 * @docPage Mouse
 */
export { default as Mouse } from './src/page/Mouse'

/**
 * @docPage TestData
 * @docAlias TestDataFactory TestData
 */
export { TestDataFactory, TestDataSource } from './src/test-data/TestData'

import { NullTestDataLoaders } from './src/test-data/TestDataLoaders'
export { NullTestDataLoaders }

/**
 * `TestData` is a pre-configured instance of <[TestDataFactory]> that can be used to prepare test data for your script.
 *
 * **Example**
 * ```typescript
 * import { step, Browser, TestData, TestSettings } from '@flood/element'
 *
 * interface Row {
 *   username: string
 *   userID: number
 * }
 * TestData.fromCSV<Row>('users.csv').shuffle()
 * ```
 *
 * @docPage TestData
 */
export const TestData = new NullTestDataLoaders()

/**
 * @docPage Settings
 */
export {
	TestSettings,
	setup,
	DEFAULT_SETTINGS,
	ConsoleMethod,
	ResponseTiming,
} from './src/runtime/Settings'

/**
 * @docPage DSL
 */
export { FloodProcessEnv } from './src/runtime-environment/types'

import { FloodProcessEnv, nullFloodProcessEnv } from './src/runtime-environment/types'

/**
 * A subset of `process.env` available to this test. It is of type <[FloodProcessEnv]>.
 * @docPage DSL
 */
export const ENV: FloodProcessEnv = nullFloodProcessEnv

/**
 * @docPage Browser
 */
export { Browser, Browser as Driver, Locatable, NullableLocatable } from './src/runtime/types'

/**
 * @docPage Browser
 */
export {
	ClickOptions,
	ScreenshotOptions,
	NavigationOptions,
	BoundingBox,
	LoadEvent,
} from 'puppeteer'

/**
 * @docPage DSL
 */
export { step, StepFunction, StepOptions } from './src/runtime/Step'

/**
 * @docPage DSL
 */
export { suite } from './src/runtime/types'

export * from './api'

export * from './src/runtime/EvaluatedScript'
export * from './src/runtime-environment/WorkRoot'
