import { ConditionFn, RecoverWith, Step, StepRecoveryObject } from './Step'
import { Browser as BrowserInterface } from '../interface/IBrowser'
import { Looper } from '../Looper'

export default class StepIterator {
	private steps: Step[]
	private stepCount = 0
	private currentStep: Step

	constructor(allSteps: Step[]) {
		this.steps = allSteps
	}

	get step(): Step {
		return this.currentStep
	}

	goNextStep(): void {
		this.stepCount += 1
	}

	goPreviousStep(): void {
		this.stepCount -= 1
	}

	stepEnd(): void {
		this.stepCount = this.steps.length
	}

	stop(): void {
		this.stepCount = this.steps.length
	}

	async run(iterator: (step: Step) => Promise<void>): Promise<void> {
		while (this.stepCount < this.steps.length) {
			this.currentStep = this.steps[this.stepCount]
			await iterator(this.currentStep)
			this.goNextStep()
		}
	}

	loopUnexecutedSteps(callBackFn: (step: Step) => void): void {
		if (this.currentStep?.options?.repeat) {
			callBackFn(this.currentStep)
		}
		while (this.stepCount < this.steps.length) {
			this.stepCount = Math.max(this.stepCount, 0)
			this.goNextStep()
			this.currentStep = this.steps[this.stepCount]
			if (this.currentStep) {
				callBackFn(this.currentStep)
			}
		}
	}

	async callCondition(step: Step, iteration: number, browser: BrowserInterface): Promise<boolean> {
		const { once, skip, pending, repeat, stepWhile, predicate } = step.options

		if (pending || (once && iteration > 1)) {
			step.prop = { unexecuted: true }
			return false
		}
		if (skip) {
			step.prop = { skipped: true }
			return false
		}

		if (repeat) {
			const { iteration, count } = repeat
			if (iteration >= count - 1) {
				repeat.iteration = 0
			} else {
				repeat.iteration += 1
				this.goPreviousStep()
			}
			return true
		}

		if (stepWhile) {
			const { predicate } = stepWhile
			const condition = await this.callPredicate(predicate, browser)
			if (!condition) {
				step.prop = { unexecuted: true }
				return false
			}
			return true
		}

		if (predicate) {
			const condition = await this.callPredicate(predicate, browser)
			if (!condition) {
				step.prop = { unexecuted: true }
				return false
			}
			return true
		}

		return true
	}

	async callPredicate(predicate: ConditionFn, browser: BrowserInterface): Promise<boolean> {
		let condition = false
		try {
			condition = await predicate.call(null, browser)
		} catch (err) {
			console.error(err.message)
		}
		return condition
	}

	async callRecovery(
		step: Step,
		looper: Looper,
		browser: BrowserInterface,
		recoverySteps: StepRecoveryObject,
		tries: number,
	): Promise<boolean> {
		let stepRecover = recoverySteps[step.name]
		if (!stepRecover) {
			stepRecover = recoverySteps['global']
			if (!stepRecover) return false
		}
		const { recoveryStep, loopCount, iteration } = stepRecover
		const settingRecoveryCount = loopCount || tries || 1
		if (!recoveryStep || iteration >= settingRecoveryCount) {
			stepRecover.iteration = 0
			return false
		}
		stepRecover.iteration += 1
		if (step.prop) {
			step.prop.recoveryTries = stepRecover.iteration
		} else {
			step.prop = { recoveryTries: stepRecover.iteration }
		}
		try {
			const result = await recoveryStep.fn.call(null, browser)
			const { repeat } = step.options
			if (result === RecoverWith.CONTINUE) {
				stepRecover.iteration = 0
				step.prop.recoveryTries = 0
			} else if (result === RecoverWith.RESTART) {
				if (repeat) repeat.iteration = 0
				looper.restartLoop()
				step.prop.recoveryTries = 0
				this.stepEnd()
			} else if (result === RecoverWith.RETRY) {
				if (repeat) repeat.iteration -= 1
				else this.goPreviousStep()
			}
		} catch (err) {
			return false
		}

		return true
	}
}
