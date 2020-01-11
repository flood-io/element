import { VMScript } from 'vm2'
import { TestScriptErrorMapper } from './TestScript'
export interface ITestScript extends TestScriptErrorMapper {
	sandboxedFilename: string
	vmScript: VMScript
	source: string
	sourceMap: string
	settings?: any
	steps?: any[]
	formattedErrorString: string
	hasErrors: boolean
	compile(): Promise<ITestScript>
	isFloodElementCorrectlyImported: boolean
	testName: string
	testDescription: string
}
