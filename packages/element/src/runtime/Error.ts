export class DocumentedError extends Error {
	_documented = 'yes'
	public callContext?: string
	public errorDoc: string
	public stack?: string
	public originalError?: Error

	constructor(message: string, doc: string, callContext?: string, originalError?: Error) {
		super(message)
		if (callContext !== undefined) {
			this.message = `${callContext}: ${message}`
		}
		this.errorDoc = doc
		this.callContext = callContext
		this.originalError = originalError
		Error.captureStackTrace(this, this.constructor)
	}

	static wrapUnhandledError(err: Error, message?: string, callContext?: string) {
		return new DocumentedError(
			message || err.message,
			'Documentation needed! Please report this at https://github.com/flood-io/element/issues so that we can improve Element!',
			callContext,
			err,
		)
	}
}

export class StructuredError<T> extends Error {
	_structured = 'yes'
	public data: T
	public stack?: string
	public originalError?: Error
	constructor(public message: string, data: T, originalError?: Error) {
		super(message)
		Object.setPrototypeOf(this, StructuredError.prototype)
		this.data = data
		this.originalError = originalError
		Error.captureStackTrace(this, this.constructor)
	}

	static cast<TT>(err: Error): StructuredError<TT> | undefined {
		if ((<StructuredError<TT>>err)._structured === 'yes') {
			return <StructuredError<TT>>err
		} else {
			return undefined
		}
	}
}
