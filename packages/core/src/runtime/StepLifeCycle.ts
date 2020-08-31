import { Browser } from '../interface/IBrowser'

export declare function afterAll(fn: HookFn, waitTimeout?: number): void
export declare function afterEach(fn: HookFn, waitTimeout?: number): void
export declare function beforeAll(fn: HookFn, waitTimeout?: number): void
export declare function beforeEach(fn: HookFn, waitTimeout?: number): void

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
