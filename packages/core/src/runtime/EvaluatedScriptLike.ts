import { TestScriptError } from '@flood/element-report'
import { TestSettings } from './Settings'
import { TestDataSource } from '../test-data/TestData'
import { ITest } from '../interface/ITest'
import { RuntimeEnvironment } from '../runtime-environment/types'
import { Step, StepRecoveryObject } from './Step'
import { Hook } from './StepLifeCycle'

export interface EvaluatedScriptLike {
	steps: Step[]
	hook: Hook
	recoverySteps: StepRecoveryObject
	settings: TestSettings
	isScriptError(error: Error): boolean
	maybeLiftError(error: Error): Error
	liftError(error: Error): TestScriptError
	filterAndUnmapStack(stack: string | Error | undefined): string[]
	bindTest(test: ITest): void
	beforeTestRun(): Promise<void>
	evaluate(): EvaluatedScriptLike
	testData: TestDataSource<any>

	runEnv: RuntimeEnvironment
}
