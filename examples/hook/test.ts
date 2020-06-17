import { TestSettings, step } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
}
export default () => {
	step('Step 1', async browser => {
		console.log('Step 1')
	})
	step('Step 2', async browser => {
		console.log('Step 2')
	})
}
