// // CLI / runtime
export {
	IReporter,
	MeasurementKind,
	TraceData,
	TestEvent,
	CompoundMeasurement,
	NetworkTraceData,
	Assertion,
} from '@flood/element-report'

// XYZ

export { runCommandLine, runSingleTestScript, ElementOptions } from '@flood/element-core'

export { TestSettings, ResponseTiming } from '@flood/element-core'
export { RuntimeEnvironment, FloodProcessEnv } from '@flood/element-core'
import { WorkRoot, launch, PlaywrightClient } from '@flood/element-core'
export { nullRuntimeEnvironment } from '@flood/element-core'

export { TestCommander } from '@flood/element-core'

export { WorkRoot, PlaywrightClient, launch }

export { TestScriptError, TestScriptOptions } from '@flood/element-core'
export { ITestScript } from '@flood/element-core'
export { EvaluatedScript, EvaluatedScriptLike } from '@flood/element-core'

export { expect } from '@flood/element-core'

// Test observer integration
export { Test } from '@flood/element-core'
export { Step } from '@flood/element-core'

export { NoOpTestObserver, TestObserver } from '@flood/element-core'

export { AssertionErrorData, castStructuredError } from '@flood/element-core'

export { IObjectTrace, NullObjectTrace } from '@flood/element-core'

export { StructuredError } from '@flood/element-core'

export { NetworkRecorder } from '@flood/element-core'
export { NetworkObserver } from '@flood/element-core'
export { Entry } from '@flood/element-core'
