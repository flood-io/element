export declare function afterAll(fnc: HookFn, timeout: number): void
export declare function afterEach(fnc: HookFn, timeout: number): void
export declare function beforeAll(fnc: HookFn, timeout: number): void
export declare function beforeEach(fnc: HookFn, timeout: number): void

export type HookFn = (this: void) => any
export interface HookBase {
	fnc: HookFn
	timeout: number
}

export type Hook = {
	afterAll: HookBase[]
	afterEach: HookBase[]
	beforeAll: HookBase[]
	beforeEach: HookBase[]
}
