import { Callsite, callsiteToString } from '../types/Callsite'
export interface Detail {
	callsite: string
	callContext: string | null
	asString: string
	unmappedStack: string[]
	doc: string | null
	causeAsString: string | undefined
	causeStack: string | undefined
}

export interface ErrorWithDoc extends Error {
	errorDoc: string
	callContext: string
}

export function originalError(e: Error): Error {
	if ((e as ErrorWithOriginalError).originalError !== undefined) {
		return originalError((e as ErrorWithOriginalError).originalError)
	} else {
		return e
	}

	interface ErrorWithOriginalError extends Error {
		originalError: Error
	}
}

export interface TestScriptErrorMapper {
	isScriptError?(error: Error): boolean
	liftError?(error: Error): TestScriptError
	maybeLiftError?(error: Error): Error
	filterAndUnmapStack?(stack: string | Error | undefined): string[]
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
		return (this.originalError as ErrorWithDoc).errorDoc !== undefined
	}
	get errorDoc(): string | null {
		if ((this.originalError as ErrorWithDoc).errorDoc !== undefined) {
			return (this.originalError as ErrorWithDoc).errorDoc
		} else {
			return null
		}
	}
	get callContext(): string | null {
		if ((this.originalError as ErrorWithDoc).callContext !== undefined) {
			return (this.originalError as ErrorWithDoc).callContext
		} else {
			return null
		}
	}
	get cause(): Error {
		return originalError(this.originalError)
	}
	toDetailObject(includeVerbose = false): Detail {
		const output: Detail = {
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
		const { message, stackWhenThrown: stack } = this
		return {
			message,
			stack,
		}
	}
}
