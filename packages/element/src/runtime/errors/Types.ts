import { StructuredError } from '../../utils/StructuredError'

export type ErrorInterpreter<T, U> = (
	err: Error,
	target: T,
	key: string,
	callCtx: string,
	...args: any[]
) => StructuredError<U>
