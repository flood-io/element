/**
 * @docPage Until
 */
export { Until } from '@flood/element-core'

/**
 * @docPage Until
 */
export { Condition } from '@flood/element-core'

/**
 * @docPage Constants
 */
export { Device, Key, MouseButtons } from '@flood/element-core'

/**
 * @docPage By
 */
export { By } from '@flood/element-core'

/**
 * @docPage By
 */
export { Locator } from '@flood/element-core'

/**
 * @docPage ElementHandle
 */
export { ElementHandle } from '@flood/element-core'

/**
 * @docPage TargetLocator
 */
export { TargetLocator } from '@flood/element-core'

/**
 * @docPage Mouse
 */
export { Mouse } from '@flood/element-core'

/**
 * @docPage TestData
 * @docAlias TestDataFactory TestData
 */
export { TestDataFactory, TestDataSource } from '@flood/element-core'

import { NullTestDataLoaders } from '@flood/element-core'
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
} from '@flood/element-core'

/**
 * @docPage DSL
 */
export { FloodProcessEnv } from '@flood/element-core'

/**
 * A subset of `process.env` available to this test. It is of type <[FloodProcessEnv]>.
 * @docPage DSL
 */
export { ENV } from '@flood/element-core'

/**
 * @docPage Browser
 */
export { Browser, Browser as Driver, Locatable, NullableLocatable } from '@flood/element-core'

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
export { step, TestFn, StepFunction, StepOptions } from '@flood/element-core'

/**
 * @docPage DSL
 */
export { suite } from '@flood/element-core'

/**
 * @docPage helpers
 */
export { RecoverWith } from '@flood/element-core'
