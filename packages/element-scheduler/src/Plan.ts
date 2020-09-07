import { RampStage } from '@flood/element-core'
import parseDuration from 'parse-duration'

type NormalizedStage = {
	duration: number
	user: number
	actual?: number
	startedAt?: Date
}

function normalizeStages(stages: RampStage[]): NormalizedStage[] {
	return stages.map(stage => {
		const duration = parseDuration(stage.duration)
		const { user } = stage
		return { duration, user }
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
		onTick: (timestamp: number, target: number, stageIterator: number) => Promise<void>,
		oneEndState: () => Promise<void>,
		oneNewState: () => Promise<void>,
	) {
		return new Promise(done => {
			const planSteps: PlanStep[] = []
			this.stages.forEach((stage, index) => {
				const { user, duration } = stage
				planSteps.push([duration, user, index])
			})

			const internal = () => {
				const planStep = planSteps.shift()
				if (!planStep) return done('end')
				oneNewState().then(() => {
					const [timeout, target] = planStep
					const handleEndStage = setTimeout(() => oneEndState().then(internal), timeout)
					onTick(...planStep).then(() => oneEndState().then(internal))
					if (target < 1) {
						clearTimeout(handleEndStage)
						oneEndState().then(internal)
					}
				})
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
			if (stage.user > total) total = stage.user
		})
		return total
	}
}
