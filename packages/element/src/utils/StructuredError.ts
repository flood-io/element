// interface EmptyData {}

export class StructuredError<T> extends Error {
	_structured = 'yes'

	public kind: string
	public source: string = 'unknown'
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

	static liftWithSource<TT>(err: Error, source: string, callContext: string): StructuredError<TT> {
		if ((<StructuredError<TT>>err)._structured === 'yes') {
			;(<StructuredError<TT>>err).callContext = callContext
			;(<StructuredError<TT>>err).source = source
			return <StructuredError<TT>>err
		} else {
			return new StructuredError<TT>(err.message, {} as TT, err, source, callContext)
		}
	}

	static isA<TT>(err: Error): boolean {
		return (<StructuredError<TT>>err)._structured === 'yes'
	}

	static cast<TT>(err: Error): StructuredError<TT> | undefined {
		if ((<StructuredError<TT>>err)._structured === 'yes') {
			return <StructuredError<TT>>err
		} else {
			return undefined
		}
	}

	static wrapBareError<TT>(
		err: Error,
		source: string,
		kind: string,
		data: TT,
	): StructuredError<TT> {
		const serr = new StructuredError<TT>(err.message, data, err)
		serr.source = source
		serr.kind = kind
		return serr
	}
}
