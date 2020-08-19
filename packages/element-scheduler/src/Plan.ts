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

type Step = [
	// time
	number,
	// delta
	number,
	// total
	number,
]

export class Plan {
	private stages: NormalizedStage[]

	constructor(stages: RampStage[]) {
		this.stages = normalizeStages(stages)
	}

	public make() {
		const forecast: Step[] = []
		let time = 0
		let current = 0
		let previousTarget = 0
		this.stages.forEach(stage => {
			const { target, duration } = stage
			let targetDelta = 0
			if (target > previousTarget) {
				targetDelta += target - previousTarget
			} else if (target < previousTarget) {
				targetDelta -= previousTarget + target
			} else {
				targetDelta = 0
			}
			previousTarget = target

			let step = Math.ceil(duration / targetDelta)
			if (!isFinite(step)) step = duration

			if (targetDelta > 0) {
				// if stage delta is positive, add users each step
				for (let i = 0; i < targetDelta; i++) {
					current++
					time += step
					forecast.push([time, 1, current])
				}
			} else if (targetDelta < 0) {
				// if stage delta is negative, remove users each step
				for (let i = targetDelta; i < 0; i++) {
					time += step * -1
					current--
					forecast.push([time, -1, current])
				}
			} else {
				// if stage delta is neutral, do nothing
				time += duration
				current = target

				forecast.push([time, 0, current])
			}
		})
		return forecast
	}

	/**
	 * TODO: Implement cancellation token
	 */
	public ticker(
		onTick: (timestamp: number, target: number, total?: number) => void | Promise<void>,
	) {
		return new Promise(yeah => {
			const plan = this.make()
			let previousTimeout = 0
			const internal = () => {
				const step = plan.shift()
				if (step) {
					const [timeout] = step
					Promise.resolve(onTick(...step)).then(() => {
						setTimeout(internal, timeout - previousTimeout)
						previousTimeout = timeout
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
