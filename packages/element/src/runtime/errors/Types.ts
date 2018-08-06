import { DocumentedError } from '../../utils/DocumentedError'

export type ErrorInterpreter<T> = (
	err: Error,
	target: T,
	key: string,
	callCtx: string,
	...args: any[]
) => DocumentedError
