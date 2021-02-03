import { LocatorBuilder, EvaluateFn } from '../types'

export class EvalLocator implements LocatorBuilder {
	constructor(
		public pageFunc: EvaluateFn<string | undefined>,
		public pageFuncMany: EvaluateFn<string | undefined>,
		public pageFuncArgs: string[],
	) {}

	toString() {
		return `eval()`
	}
}
