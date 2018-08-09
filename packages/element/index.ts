import { TestSettings } from './src/runtime/Settings'
import { FloodProcessEnv, nullFloodProcessEnv } from './src/runtime-environment/types'
import { Until } from './src/page/Until'
import { Device, MouseButtons } from './src/page/Enums'
import { TestData } from './src/test-data/TestData'

export { TestSettings, Until, Device, MouseButtons, TestData }

export { By } from './src/page/By'

export function setup(s: TestSettings) {}
export const ENV: FloodProcessEnv = nullFloodProcessEnv

export { Browser, Browser as Driver } from './src/runtime/types'

export { step } from './src/runtime/Step'
