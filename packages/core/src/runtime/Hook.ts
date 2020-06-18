import { Browser } from './types'

export declare function afterAll(fnc: HookFn, timeout?: number): void
export declare function afterEach(fnc: HookFn, timeout?: number): void
export declare function beforeAll(fnc: HookFn, timeout?: number): void
export declare function beforeEach(fnc: HookFn, timeout?: number): void

export type HookFn = (this: void, browser: Browser) => Promise<any>
export interface HookBase {
	fn: HookFn
	timeout?: number
}

export interface Hook {
	afterAll: HookBase[]
	afterEach: HookBase[]
	beforeAll: HookBase[]
	beforeEach: HookBase[]
}

/**
 * @internal
 */
export function normalizeHookBase(hookBase: HookBase): HookBase {
	const { timeout } = hookBase
	hookBase.timeout = timeout && timeout > 0 ? timeout : 30 * 1e3
	return hookBase
}
