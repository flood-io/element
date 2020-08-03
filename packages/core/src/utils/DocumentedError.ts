interface MaybeHasCallContext {
	callContext?: string
}

export class DocumentedError extends Error {
	_documented = 'yes'
	public callContext?: string
	public errorDoc: string
	public stack?: string
	public originalError?: Error

	constructor(message: string, doc: string, callContext?: string, originalError?: Error) {
		super(message)
		this.errorDoc = doc
		this.callContext = callContext
		this.originalError = originalError
		Error.captureStackTrace(this, this.constructor)
	}

	static documented(
		err: Error,
		message: string,
		doc: string,
		callContext?: string,
	): DocumentedError {
		if (callContext === undefined && (err as MaybeHasCallContext).callContext !== undefined) {
			callContext = (err as MaybeHasCallContext).callContext
		}
		return new DocumentedError(message, doc, callContext, err).copyStackFromOriginalError()
	}

	copyStackFromOriginalError(): DocumentedError {
		if (this.originalError) {
			this.stack = this.originalError.stack
		}
		return this
	}

	static liftAddingCallContext(err: Error, callCtx: string): Error {
		if ((err as DocumentedError)._documented === 'yes') {
			;(err as DocumentedError).callContext = callCtx
			return err
		} else {
			return err
		}
	}
}
