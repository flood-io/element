import { step, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 2,
}

export default () => {
	step('Test normal', async browser => {
		console.log('Step normal is still runs')
	})

	step.once('Test once', async browser => {
		console.log('Step once runs 1 time')
	})

	step.if(
		() => true,
		'Test if',
		async browser => {
			console.log('Step if runs with condition true')
		},
	)

	step.unless(
		() => false,
		'Test unless',
		async browser => {
			console.log('Test unless runs with condition false')
		},
	)

	step.skip('Test skip', async browser => {
		console.log('Test skip')
	})

	step('Step pending')
}
