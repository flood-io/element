interface EmptyErrorData {
	_kind: 'empty'
}

export class StructuredError<T> extends Error {
	_structured = 'yes'

	public wrappedUnstructured = false
	public kind: string
	public source = 'unknown'
	public callContext?: string

	public data: T
	public stack?: string
	public originalError?: Error

	constructor(
		public message: string,
		data: T,
		originalError?: Error,
		source?: string,
		callContext?: string,
	) {
		super(message)
		Object.setPrototypeOf(this, StructuredError.prototype)
		this.data = data
		this.originalError = originalError
		if (source !== undefined) {
			this.source = source
		}
		this.callContext = callContext
		Error.captureStackTrace(this, this.constructor)
	}

	copyStackFromOriginalError(): StructuredError<T> {
		if (this.originalError) {
			this.stack = this.originalError.stack
		}
		return this
	}

	static liftWithSource<TT>(
		err: Error,
		source: string,
		callContext: string,
	): StructuredError<TT | EmptyErrorData> {
		if ((err as StructuredError<TT>)._structured === 'yes') {
			;(err as StructuredError<TT>).callContext = callContext
			;(err as StructuredError<TT>).source = source
			return err as StructuredError<TT>
		} else {
			return new StructuredError<EmptyErrorData>(
				err.message,
				{ _kind: 'empty' } as EmptyErrorData,
				err,
				source,
				callContext,
			)
		}
	}

	static isA<TT>(err: Error): boolean {
		return (err as StructuredError<TT>)._structured === 'yes'
	}

	static cast<TT>(err: Error): StructuredError<TT> | undefined {
		if ((err as StructuredError<TT>)._structured === 'yes') {
			return err as StructuredError<TT>
		} else {
			return undefined
		}
	}

	static wrapBareError<TT>(
		err: Error,
		data: TT,
		source?: string,
		kind?: string,
	): StructuredError<TT> {
		const serr = new StructuredError<TT>(err.message, data, err)
		if (source) serr.source = source
		serr.kind = kind || 'unknown'
		serr.wrappedUnstructured = true
		return serr
	}
}
