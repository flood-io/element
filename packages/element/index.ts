/**
 * Provide an api for Element test scripts
 */
export { Until } from './src/page/Until'
export { Device, MouseButtons, Key } from './src/page/Enums'
export { By } from './src/page/By'
export { Locator, ElementHandle } from './src/page/types'

export { TestData } from './src/test-data/TestData'

export { TestSettings, setup } from './src/runtime/Settings'

import { FloodProcessEnv, nullFloodProcessEnv } from './src/runtime-environment/types'
/**
 * A subset of process.env available to this test.
 */
export const ENV: FloodProcessEnv = nullFloodProcessEnv

export { Browser, Browser as Driver } from './src/runtime/types'

export { step } from './src/runtime/Step'
