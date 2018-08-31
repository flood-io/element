import { StructuredError } from '../../utils/StructuredError'

export type ErrorInterpreter<T, U extends ErrorData> = (
	err: Error,
	target: T,
	key: string,
	...args: any[]
) => StructuredError<U> | undefined

export type AnyErrorData =
	| EmptyErrorData
	| NetworkErrorData
	| ActionErrorData
	| AssertionErrorData
	| LocatorErrorData
	| PuppeteerErrorData

type ErrorDataKind = 'net' | 'action' | 'empty' | 'assertion' | 'locator' | 'puppeteer'

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

export interface PuppeteerErrorData {
	_kind: 'puppeteer'
	kind: 'execution-context-destroyed'
}

export function interpretError<T, U extends ErrorData>(
	interpreters: ErrorInterpreter<T, U>[],
	inputError: Error,
	target: T,
	propertyKey: string,
	args: any[],
): StructuredError<U> | Error {
	for (const interp of interpreters) {
		const outputErr = interp(inputError, target, propertyKey, ...args)
		if (outputErr !== undefined) return outputErr
	}

	return inputError
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
