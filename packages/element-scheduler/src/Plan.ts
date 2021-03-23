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
		onTick: (timestamp: number, target: number, stageIterator: number) => Promise<void>,
		onEndState: (forceStop?: boolean, sigint?: boolean) => Promise<void>,
		onNewState: () => Promise<void>,
	): Promise<unknown> {
		return new Promise(done => {
			const planSteps: PlanStep[] = []
			this.stages.forEach((stage, index) => {
				const { target, duration } = stage
				planSteps.push([duration, target, index])
			})

			const internal = () => {
				const planStep = planSteps.shift()
				if (!planStep) return done('end')
				onNewState().then(() => {
					const [timeout, target] = planStep
					const handleEndStage = setTimeout(() => onEndState(true).then(internal), timeout)
					onTick(...planStep).then(() => onEndState().then(internal))
					if (target < 1) {
						clearTimeout(handleEndStage)
						onEndState().then(internal)
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
			if (stage.target > total) total = stage.target
		})
		return total
	}
}
