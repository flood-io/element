import { step, TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: 1,

	// Pass proxy args to Chrome on launch. For additional flags see https://peter.sh/experiments/chromium-command-line-switches/
	launchArgs: ['--proxy-server=127.0.0.1:9876'],
}

export default () => {
	step('Visit homepage', async b => {
		await b.visit('https://google.com')
	})
}
