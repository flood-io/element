import { step, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 2,
}

export default () => {
	step.once('Test: 1', async browser => {
		console.log('This step run only 1 time')
	})

	step('Test: 2', async browser => {
		console.log('This step run 2 times')
	})
}
