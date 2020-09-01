import { PlaywrightClientLike, launch } from '../../src/driver/Playwright'
export { PlaywrightClientLike as testPlaywright }
import { DEFAULT_SETTINGS } from '../../src/runtime/Settings'

export async function launchPlaywright(): Promise<PlaywrightClientLike> {
	let opts = {
		sandbox: true,
	}

	if (process.env.NO_CHROME_SANDBOX === '1') {
		opts.sandbox = false
	}

	return launch(opts, DEFAULT_SETTINGS)
}
