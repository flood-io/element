export { runCommandLine, runSingleTestScript } from './src/Element'
export { ElementRunArguments, ElementOptions } from './src/ElementOption'

export { RuntimeEnvironment } from './src/runtime-environment/types'
export { nullRuntimeEnvironment } from './src/runtime-environment/NullRuntimeEnvironment'

export { TestCommander } from './src/Runner'

export { PlaywrightClient, launch, connectWS, launchBrowserServer } from './src/driver/Playwright'

export { TestScriptOptions } from './src/TestScriptOptions'
export { TestScriptError, expect } from '@flood/element-report'
export { ITestScript } from './src/interface/ITestScript'

// Test observer integration
export { default as Test } from './src/runtime/Test'
export { Step } from './src/runtime/Step'

export {
	NoOpTestObserver,
	TestObserver,
	NullTestObserver,
} from './src/runtime/test-observers/TestObserver'

export { Timing } from './src/runtime/test-observers/Timing'
export { NetworkRecordingTestObserver } from './src/runtime/test-observers/NetworkRecordingTestObserver'
export { Context } from './src/runtime/test-observers/Context'
export { TimingObserver } from './src/runtime/test-observers/TimingObserver'

export { AssertionErrorData, castStructuredError } from './src/runtime/errors/Types'

export { IObjectTrace, NullObjectTrace } from './src/utils/ObjectTrace'

export { StructuredError } from './src/utils/StructuredError'

export { default as NetworkRecorder } from './src/network/Recorder'
export { Entry } from './src/network/Protocol'
export { default as NetworkObserver } from './src/runtime/test-observers/NetworkObserver'
export { mustCompileFile } from './src/TestScript'
export { DEFAULT_SETTINGS } from './src/runtime/Settings'
export { normalizeElementOptions } from './src/ElementOption'
