import { RampStage } from '@flood/element-core'
import parseDuration from 'parse-duration'

type NormalizedStage = {
	duration: number
	target: number
	actual?: number
	startedAt?: Date
}

function normalizeStages(stages: RampStage[]): NormalizedStage[] {
	return stages.map(stage => {
		const duration = parseDuration(stage.duration)
		const { target } = stage
		return { duration, target }
	})
}

type PlanStep = [number, number, number]

export class Plan {
	private stages: NormalizedStage[]

	constructor(stages: RampStage[]) {
		this.stages = normalizeStages(stages)
	}

	/**
	 * TODO: Implement cancellation token
	 */
	public ticker(
		onTick: (timestamp: number, target: number, stageIterator) => void | Promise<void>,
		oneEndState: () => Promise<void>,
		oneNewState: () => Promise<void>,
	) {
		return new Promise(yeah => {
			const planSteps: PlanStep[] = []
			this.stages.forEach((stage, index) => {
				const { target, duration } = stage
				planSteps.push([duration, target, index])
			})

			const internal = () => {
				const planStep = planSteps.shift()
				if (planStep) {
					oneNewState().then(() => {
						const [timeout] = planStep
						Promise.resolve(onTick(...planStep)).then(() => {
							setTimeout(() => {
								oneEndState().then(internal)
							}, timeout)
						})
					})
				} else {
					yeah()
				}
			}
			internal()
		})
	}

	public get maxDuration(): number {
		let total = 0
		this.stages.forEach(stage => {
			total += stage.duration
		})
		return total
	}

	public get maxUsers(): number {
		let total = 0
		this.stages.forEach(stage => {
			if (stage.target > total) total = stage.target
		})
		return total
	}
}
