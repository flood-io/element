import { VMScript } from 'vm2'
import * as ts from 'typescript'
import { TypeScriptTestScript } from './test-script/Compiler'
import { Callsite, callsiteToString } from './test-script/SourceUnmapper'

export class TestScriptError extends Error {
	public stackWhenThrown: string
	constructor(
		message: string,
		originalStack: string,
		public callsite: Callsite,
		public unmappedStack: string[],
	) {
		super(message)
		this.stackWhenThrown = this.stack || ''
		this.stack = originalStack
		this.message = message
	}

	toStringNodeFormat(): string {
		return this.callsiteString() + '\n\n' + this.toString() + '\n' + this.unmappedStack.join('\n')
	}

	callsiteString(): string {
		return callsiteToString(this.callsite)
	}

	toJSON() {
		let { message, stackWhenThrown: stack } = this

		return {
			message,
			stack,
		}
	}
}

export interface TestScriptOptions {
	stricterTypeChecking: boolean
}

export const TestScriptDefaultOptions: TestScriptOptions = {
	stricterTypeChecking: false,
}

export interface ITestScript {
	sandboxedFilename: string
	vmScript: VMScript
	source: string
	sourceMap: string

	formattedErrorString: string
	hasErrors: boolean

	compile(): Promise<ITestScript>

	isFloodElementCorrectlyImported: boolean
	testName: string
	testDescription: string

	liftError(error: Error): TestScriptError
	maybeLiftError(error: Error): Error
	filterAndUnmapStack(stack: string | undefined): string[]
}

export async function compileString(
	source: string,
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	return new TypeScriptTestScript(source, filename, testScriptOptions).compile()
}

export async function compileFile(
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript | undefined> {
	const fileContent = ts.sys.readFile(filename)
	if (fileContent === undefined) {
		return undefined
	}

	return new TypeScriptTestScript(fileContent, filename, testScriptOptions).compile()
}

export async function mustCompileString(
	source: string,
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	const testScript = await compileString(source, filename)

	if (testScript.hasErrors) {
		throw new Error(`errors compiling script ${filename}:\n${testScript.formattedErrorString}`)
	}

	return testScript
}

export async function mustCompileFile(
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	const testScript = await compileFile(filename)

	if (testScript === undefined) {
		throw new Error(`errors compiling script ${filename}:\nunable to read`)
	}

	if (testScript.hasErrors) {
		throw new Error(`errors compiling script ${filename}:\n${testScript.formattedErrorString}`)
	}

	return testScript
}
