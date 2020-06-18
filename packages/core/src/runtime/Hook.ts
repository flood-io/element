export declare function afterAll(fnc: HookFn, timeout?: number): void
export declare function afterEach(fnc: HookFn, timeout?: number): void
export declare function beforeAll(fnc: HookFn, timeout?: number): void
export declare function beforeEach(fnc: HookFn, timeout?: number): void

export type HookFn = (this: void) => any
export interface HookBase {
	fnc: HookFn
	timeout?: number
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
	// Convert user inputted seconds to milliseconds
	if (typeof hookBase.timeout === 'number' && hookBase.timeout > 1e3) {
		hookBase.timeout = hookBase.timeout / 1e3
	} else if (Number(hookBase.timeout) === 0 || !hookBase.timeout) {
		hookBase.timeout = 30
	}

	return hookBase
}
