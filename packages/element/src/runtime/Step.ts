import { Browser, StepOptions } from '../../index'

export interface Step {
	fn: StepFunction
	name: string
	stepOptions: StepOptions
}

export type StepFunction = (driver: Browser, data?: any) => Promise<void>

export function normalizeStepOptions(stepOpts: StepOptions): StepOptions {
	// Convert user inputted seconds to milliseconds
	if (typeof stepOpts.waitTimeout === 'number' && stepOpts.waitTimeout > 1e3) {
		stepOpts.waitTimeout = stepOpts.waitTimeout / 1e3
	} else if (Number(stepOpts.waitTimeout) === 0) {
		stepOpts.waitTimeout = 30
	}

	return stepOpts
}
