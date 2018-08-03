import { VMScript } from 'vm2'
import * as ts from 'typescript'
import { TypeScriptTestScript } from './test-script/Compiler'
import { Callsite, callsiteToString } from './test-script/SourceUnmapper'

export interface ErrorWrapper {
	wrappedError: Error
}

export function unwrapError(e: Error | ErrorWrapper): Error {
	if ((<ErrorWrapper>e).wrappedError !== undefined) {
		return (<ErrorWrapper>e).wrappedError
	} else {
		return e as Error
	}
}

function originalError(e: Error): Error {
	if ((<errorWithOriginalError>e).originalError !== undefined) {
		return originalError((<errorWithOriginalError>e).originalError)
	} else {
		return e
	}
}

interface errorWithDoc extends Error {
	errorDoc: string
}
interface errorWithOriginalError extends Error {
	originalError: Error
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

	get cause(): Error {
		return originalError(this.originalError)
	}

	toStringNodeFormat(): string {
		let str =
			this.callsiteString() + '\n\n' + this.toString() + '\n' + this.unmappedStack.join('\n')
		if (this.hasDoc) {
			str = str + '\nDetail:\n' + this.errorDoc
		}
		return str
	}

	toVerboseString(): string {
		const baseString = this.toStringNodeFormat()

		// TODO report top->cause chain

		return baseString + '\n\nExtra detail:\n' + this.cause.toString() + '\n' + this.cause.stack
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
