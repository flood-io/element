import {
	TestSettings,
	step,
	afterAll,
	afterEach,
	beforeAll,
	beforeEach,
	RecoverWith,
} from '@flood/element'

export const settings: TestSettings = {
	loopCount: 2,
}
export default () => {
	//step.skip('Step: skip', async browser => {})
	step.repeat(2, 'Step: second', async browser => {})
	// step.recovery('Step: first', async browser => {
	// 	return RecoverWith.RETRY
	// })
	// step('Step: first', async browser => {
	// 	throw new Error()
	// })
	// step.once('Step: fourth', async browser => {})
	// let countWhile = 0
	// step.while(
	// 	() => countWhile < 3,
	// 	'Step: fifth',
	// 	async browser => {
	// 		countWhile++
	// 	},
	// )
	// step.if(
	// 	() => countWhile < 3,
	// 	'Step: sixth',
	// 	async browser => {
	// 		countWhile++
	// 	},
	// )
	// step.unless(
	// 	() => countWhile < 3,
	// 	'Step: seventh',
	// 	async browser => {
	// 		countWhile++
	// 	},
	// )
}
