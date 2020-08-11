import { VMScript } from 'vm2'
import { TestScriptErrorMapper } from '../TestScriptError'

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface ITestScript extends TestScriptErrorMapper {
	sandboxesFilename: string
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

	scriptRoot?: string
}
