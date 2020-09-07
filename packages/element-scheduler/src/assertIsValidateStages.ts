import { cpus } from 'os'
import parseDuration from 'parse-duration'
import { RampStage } from '@flood/element-core'
import { AssertionError } from 'assert'

export const MAX_THREAD_PER_CPU = 7

export function assertIsValidateStages(stages: any): asserts stages is RampStage[] {
	if (stages == null || stages.length == 0)
		throw new AssertionError({ message: `At least 1 stage must be specified to use scheduler` })
	stages.forEach((stage: RampStage, i: number) => {
		const { duration, user } = stage
		if (duration == null)
			throw new AssertionError({ message: `the duration for stage ${i + 1} must be set` })
		const durationMs = parseDuration(duration)
		if (durationMs < 0)
			throw new AssertionError({ message: `the duration for stage ${i + 1} shouldn't be negative` })
		if (user == null)
			throw new AssertionError({ message: `the target for stage ${i + 1} must be set` })
		if (typeof user != 'number' || user < 0)
			throw new AssertionError({
				message: `the target for stage ${i + 1} must be a non-negative number`,
			})
		if (user > cpus().length * MAX_THREAD_PER_CPU) {
			throw new AssertionError({
				message: `the target for stage ${i + 1} too high for available CPUs, please decrease`,
			})
		}
	})
}
