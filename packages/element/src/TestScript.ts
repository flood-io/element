import { VMScript } from 'vm2'
import * as ts from 'typescript'
import { TypeScriptTestScript } from './test-script/Compiler'
import { Callsite, callsiteToString } from './test-script/SourceUnmapper'

export interface ErrorWrapper {
	originalError: Error
}

export function unwrapError(e: Error | ErrorWrapper): Error {
	if ((<ErrorWrapper>e).originalError !== undefined) {
		return (<ErrorWrapper>e).originalError
	} else {
		return e as Error
	}
}

interface errorWithDoc extends Error {
	errorDoc: string
}

export class TestScriptError extends Error {
	public stackWhenThrown: string
	constructor(
		message: string,
		originalStack: string,
		public callsite: Callsite,
		public unmappedStack: string[],
		public originalError: Error,
	) {
		super(message)
		this.stackWhenThrown = this.stack || ''
		this.stack = originalStack
		this.message = message
	}

	get hasDoc(): boolean {
		return (<errorWithDoc>this.originalError).errorDoc !== undefined
	}

	get errorDoc(): string {
		if ((<errorWithDoc>this.originalError).errorDoc !== undefined) {
			return (<errorWithDoc>this.originalError).errorDoc
		} else {
			return ''
		}
	}

	toStringNodeFormat(): string {
		console.log('in toStringNodeFormat', this.originalError, this.hasDoc, this.errorDoc)
		let str =
			this.callsiteString() + '\n\n' + this.toString() + '\n' + this.unmappedStack.join('\n')
		if (this.hasDoc) {
			str = str + '\n\n' + this.errorDoc
		}
		return str
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

	isScriptError(error: Error | ErrorWrapper): boolean
	liftError(error: Error | ErrorWrapper): TestScriptError
	maybeLiftError(error: Error | ErrorWrapper): Error
	filterAndUnmapStack(stack: string | Error | ErrorWrapper | undefined): string[]
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
