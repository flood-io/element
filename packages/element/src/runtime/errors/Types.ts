import { StructuredError } from '../../utils/StructuredError'

export type ErrorInterpreter<T, U extends ErrorData> = (
	err: Error,
	target: T,
	key: string,
	...args: any[]
) => StructuredError<U>

export type AnyErrorData =
	| EmptyErrorData
	| NetworkErrorData
	| ActionErrorData
	| AssertionErrorData
	| LocatorErrorData
type ErrorDataKind = 'net' | 'action' | 'empty' | 'assertion' | 'locator'
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
	action: string
}

export interface AssertionErrorData {
	_kind: 'assertion'
}

export interface LocatorErrorData {
	_kind: 'locator'
	kind: string
	locator: string
}

export function castStructuredError<T extends ErrorData>(
	error: Error,
	kind: ErrorDataKind,
): StructuredError<T> | undefined {
	if (
		(<StructuredError<T>>error)._structured === 'yes' &&
		(<StructuredError<T>>error).data._kind === kind
	) {
		return <StructuredError<T>>error
	} else {
		return undefined
	}
}

export function getStructuredData<T extends ErrorData>(
	error: Error,
	kind: ErrorDataKind,
): T | undefined {
	if (
		(<StructuredError<T>>error)._structured === 'yes' &&
		(<StructuredError<T>>error).data._kind === kind
	) {
		return (<StructuredError<T>>error).data
	}
}
