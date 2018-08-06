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

	static liftAddingCallContext(err: Error, callCtx: string): Error {
		if ((<DocumentedError>err)._documented === 'yes') {
			;(<DocumentedError>err).callContext = callCtx
			return err
		} else {
			return DocumentedError.wrapUnhandledError(err, err.message, callCtx)
		}
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
