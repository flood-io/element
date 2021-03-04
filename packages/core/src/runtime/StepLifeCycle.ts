import ms from 'ms'
import { Browser } from '../interface/IBrowser'
import { DEFAULT_WAIT_TIMEOUT_MILLISECONDS } from './Settings'

export declare function afterAll(fn: HookFn, waitTimeout?: string | number): void
export declare function afterEach(fn: HookFn, waitTimeout?: string | number): void
export declare function beforeAll(fn: HookFn, waitTimeout?: string | number): void
export declare function beforeEach(fn: HookFn, waitTimeout?: string | number): void

export type HookFn = (this: void, browser: Browser) => Promise<any>
export type HookBase = {
	fn: HookFn
	waitTimeout: string | number
	type: HookType
}

export type Hook = {
	afterAll: HookBase[]
	afterEach: HookBase[]
	beforeAll: HookBase[]
	beforeEach: HookBase[]
}

export enum HookType {
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
}

/**
 * @internal
 */
export function normalizeHookBase(hookBase: HookBase): HookBase {
	const { waitTimeout } = hookBase
	let convertedWaitTimeout = DEFAULT_WAIT_TIMEOUT_MILLISECONDS
	if (waitTimeout) {
		if (typeof waitTimeout === 'string') {
			convertedWaitTimeout = ms(waitTimeout)
		} else {
			convertedWaitTimeout = waitTimeout
			if (convertedWaitTimeout < 0) convertedWaitTimeout = DEFAULT_WAIT_TIMEOUT_MILLISECONDS
			if (convertedWaitTimeout < 1e3) convertedWaitTimeout *= 1e3
		}
	}
	hookBase.waitTimeout = convertedWaitTimeout
	return hookBase
}
