import { StructuredError } from '../../utils/StructuredError'

export type ErrorInterpreter<T, U extends ErrorData> = (
	err: Error,
	target: T,
	key: string,
	...args: any[]
) => StructuredError<U>

export type AnyErrorData = EmptyErrorData | NetworkErrorData | ActionErrorData
type ErrorDataKind = 'net' | 'action' | 'empty'
export interface ErrorData {
	_kind: ErrorDataKind
}

export interface EmptyErrorData {
	_kind: 'empty'
}
export const emptyErrorData = { _kind: 'empty' as ErrorDataKind }

type NetworkErrorKind = 'net' | 'http'
export interface NetworkErrorData {
	_kind: 'net'
	kind: NetworkErrorKind
	subKind: string
	url: string
	reason?: string
	code?: string
}

export interface ActionErrorData {
	_kind: 'action'
	kind: string
}
