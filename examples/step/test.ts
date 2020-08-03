import { step, TestSettings, RecoverWith } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 2,
}

export default () => {
	let repeatCount = 0
	step.repeat(4, 'Test repeat step', async browser => {
		if (repeatCount < 2) {
			throw new Error()
		}
	})
	step.recovery('Test repeat step', { tries: 2 }, async browser => {
		repeatCount++
		return RecoverWith.RETRY
	})
	step('Test normal step', async browser => {
		throw new Error()
	})
	step.recovery('Test normal step', async browser => {
		return RecoverWith.CONTINUE
	})
	step('Test normal 1 step', async browser => {})
	step.if(
		() => false,
		'Test if step',
		async browser => {},
	)
	step.unless(
		() => false,
		'Test unless step',
		async browser => {},
	)
	step.once('Test once step', async browser => {})
	step.skip('Test skip step', async browser => {})
	let count = 0
	step.while(
		() => count < 3,
		'Test step while',
		async browser => {
			if (count < 2) {
				throw new Error()
			}
			console.log('Test step while done')
		},
	)
	step.recovery('Test step while', { tries: 2 }, async () => {
		count++
		return RecoverWith.RETRY
	})
}
