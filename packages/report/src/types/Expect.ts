import { Option } from './Option'

export type Maybe<T> = Option<T> | undefined | void

export function expect<T>(val: Maybe<T>, message: string): T {
	if (val === null || val === undefined) throw new Error(message)
	return val as T
}
