import { step, TestSettings, RecoverWith, Key } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,
}

export default () => {
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
		console.log('This step will not be run')
	})

	let retry = false
	let restart = false

	step.recovery('Step 1', async browser => {
		console.log('Recovery step 1 done, retry step 1')
		return RecoverWith.RETRY
	})

	step.recovery('Step 2', async browser => {
		console.log('Recovery step 2 done, restart step 1')
		return RecoverWith.RESTART
	})

	step.recovery('Step 3', async browser => {
		console.log('Recovery step 3 done, continue the next step')
		return RecoverWith.CONTINUE
	})

	step('Step 1', async browser => {
		if (!retry) {
			retry = true
			console.log('Fail step 1, call recovery')
			throw Error('Fail')
		} else {
			console.log('Done step 1')
		}
	})

	step('Step 2', async browser => {
		if (!restart) {
			restart = true
			console.log('Fail step 2, call recovery')
			throw Error('Fail')
		} else {
			console.log('Done step 2')
		}
	})

	step('Step 3', async browser => {
		console.log('Throw error step 3')
		throw Error('Fail')
	})

	step('Step 4', async browser => {
		console.log('Done step 4')
	})

	let count = 0
	step.while(
		() => count < 3,
		'Step 5',
		async browser => {
			count += 1
			console.log(`Step 5 run at ${count}`)
		},
	)

	let globalRecovery = false
	step('Step 6', async browser => {
		if (!globalRecovery) {
			throw Error('Throw error step 6')
		} else {
			console.log('Done step 6')
		}
	})

	step.recovery({ tries: 2 }, async browser => {
		console.log('Global recovery')
		globalRecovery = true
		return RecoverWith.RETRY
	})
}
