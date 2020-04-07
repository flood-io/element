import { TestScriptError } from '../TestScriptError'
import { TestSettings } from './Settings'
import { TestDataSource } from '../test-data/TestData'
import { ITest } from './ITest'
import { RuntimeEnvironment } from '../runtime-environment/types'

export interface EvaluatedScriptLike {
	steps: any[]
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
