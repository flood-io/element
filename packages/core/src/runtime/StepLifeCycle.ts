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
}

export type Hook = {
	afterAll: HookBase[]
	afterEach: HookBase[]
	beforeAll: HookBase[]
	beforeEach: HookBase[]
}

/**
 * @internal
 */
export function normalizeHookBase(hookBase: HookBase): HookBase {
	const { waitTimeout } = hookBase
	let convertedWaitTimeout = 0
	if (typeof waitTimeout === 'string' && waitTimeout) {
		convertedWaitTimeout = ms(waitTimeout)
	} else if (typeof waitTimeout === 'number') {
		convertedWaitTimeout = waitTimeout
	}
	hookBase.waitTimeout =
		convertedWaitTimeout > 0 ? convertedWaitTimeout : DEFAULT_WAIT_TIMEOUT_MILLISECONDS
	return hookBase
}
