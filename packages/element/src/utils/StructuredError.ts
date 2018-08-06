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
