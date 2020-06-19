import { Browser } from './types'

export declare function afterAll(fnc: HookFn, waitTimeout?: number): void
export declare function afterEach(fnc: HookFn, waitTimeout?: number): void
export declare function beforeAll(fnc: HookFn, waitTimeout?: number): void
export declare function beforeEach(fnc: HookFn, waitTimeout?: number): void

export type HookFn = (this: void, browser: Browser) => Promise<any>
export type HookBase = {
	fn: HookFn
	waitTimeout: number
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
	hookBase.waitTimeout = waitTimeout && waitTimeout > 0 ? waitTimeout : 30 * 1e3
	return hookBase
}
