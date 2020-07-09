import { Browser } from './types'
import { DEFAULT_WAIT_TIMEOUT_SECONDS } from './Settings'
import ms from 'ms'

export declare function afterAll(fn: HookFn, waitTimeout?: any): void
export declare function afterEach(fn: HookFn, waitTimeout?: any): void
export declare function beforeAll(fn: HookFn, waitTimeout?: any): void
export declare function beforeEach(fn: HookFn, waitTimeout?: any): void

export type HookFn = (this: void, browser: Browser) => Promise<any>
export type HookBase = {
	fn: HookFn
	waitTimeout: any
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
	if (typeof waitTimeout === 'string' && waitTimeout) {
		hookBase.waitTimeout = ms(waitTimeout)
	} else {
		hookBase.waitTimeout = ms(DEFAULT_WAIT_TIMEOUT_SECONDS)
	}
	return hookBase
}
