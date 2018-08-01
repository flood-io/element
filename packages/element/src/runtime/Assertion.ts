export interface Assertion {
	message: string
	assertionName: string
	stack?: string[]
	isFailure: boolean
}
