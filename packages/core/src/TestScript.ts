// import ts from 'typescript'
// import { TypeScriptTestScript } from './test-script/Compiler'
import { Callsite, callsiteToString } from './test-script/SourceUnmapper'
import WebpackCompiler from './test-script/WebpackCompiler'
import { ITestScript } from './ITestScript'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFileSync } from 'fs-extra'

function originalError(e: Error): Error {
	if ((e as errorWithOriginalError).originalError !== undefined) {
		return originalError((e as errorWithOriginalError).originalError)
	} else {
		return e
	}
}

interface errorWithDoc extends Error {
	errorDoc: string
	callContext: string
}
interface errorWithOriginalError extends Error {
	originalError: Error
}
export interface Detail {
	callsite: string
	callContext: string | null
	asString: string
	unmappedStack: string[]
	doc: string | null
	causeAsString: string | undefined
	causeStack: string | undefined
}

export class TestScriptError extends Error {
	public stackWhenThrown: string
	constructor(
		message: string,
		originalStack: string,
		public callsite: Callsite | undefined,
		public unmappedStack: string[],
		public originalError: Error,
	) {
		super(message)
		this.stackWhenThrown = this.stack || ''
		this.stack = originalStack
		this.message = message
	}

	get hasDoc(): boolean {
		return (this.originalError as errorWithDoc).errorDoc !== undefined
	}

	get errorDoc(): string | null {
		if ((this.originalError as errorWithDoc).errorDoc !== undefined) {
			return (this.originalError as errorWithDoc).errorDoc
		} else {
			return null
		}
	}

	get callContext(): string | null {
		if ((this.originalError as errorWithDoc).callContext !== undefined) {
			return (this.originalError as errorWithDoc).callContext
		} else {
			return null
		}
	}

	get cause(): Error {
		return originalError(this.originalError)
	}

	toDetailObject(includeVerbose = false): Detail {
		let output: Detail = {
			callsite: this.callsiteString(),
			callContext: this.callContext,
			asString: this.toString(),
			unmappedStack: this.unmappedStack,
			doc: this.errorDoc,
			causeAsString: undefined,
			causeStack: undefined,
		}
		if (includeVerbose) {
			output.causeAsString = this.cause.toString()
			output.causeStack = this.cause.stack
		}

		return output
	}

	toStringNodeFormat(): string {
		return this.callsiteString() + '\n\n' + this.toString() + '\n' + this.unmappedStack.join('\n')
	}

	toVerboseString(): string {
		const baseString = this.toStringNodeFormat()

		// TODO report top->cause chain

		return (
			baseString +
			'\n\nVerbose detail:\ncause.toString():\n' +
			this.cause.toString() +
			'\ncause.stack:\n' +
			this.cause.stack
		)
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
	traceResolution: boolean
}

export const TestScriptDefaultOptions: TestScriptOptions = {
	stricterTypeChecking: false,
	traceResolution: false,
}

export interface TestScriptErrorMapper {
	isScriptError?(error: Error): boolean
	liftError?(error: Error): TestScriptError
	maybeLiftError?(error: Error): Error
	filterAndUnmapStack?(stack: string | Error | undefined): string[]
}

export async function compileString(
	source: string,
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	let tmpFile = join(tmpdir(), filename ?? 'flood-element-test-script.ts')
	writeFileSync(tmpFile, Buffer.from(source), { encoding: 'utf8' })
	return new WebpackCompiler(tmpFile, testScriptOptions).compile()

	// return new TypeScriptTestScript(source, filename, testScriptOptions).compile()
}

export async function compileFile(
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript | undefined> {
	return new WebpackCompiler(filename, testScriptOptions).compile()

	// const fileContent = ts.sys.readFile(filename)
	// if (fileContent == null) {
	// 	return
	// }

	// return new TypeScriptTestScript(fileContent, filename, testScriptOptions).compile()
}

export async function mustCompileString(
	source: string,
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	const testScript = await compileString(source, filename, testScriptOptions)

	if (testScript.hasErrors) {
		throw new Error(`unable to compile script ${filename}:\n${testScript.formattedErrorString}`)
	}

	return testScript
}

export async function mustCompileFile(
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	const testScript = await compileFile(filename, testScriptOptions)

	if (testScript == null) {
		throw new Error(
			`unable to compile script ${filename}:\nunable to read script at path ${filename}`,
		)
	}

	if (testScript.hasErrors) {
		throw new Error(
			`Error: Unable to compile Element script ${filename}: ${testScript.formattedErrorString}`,
		)
	}

	return testScript
}
