import { PlaywrightClientLike, launch } from '../../src/driver/Playwright'
export { PlaywrightClientLike as testPlaywright }

export async function launchPlaywright(): Promise<PlaywrightClientLike> {
	let opts = {
		sandbox: true,
	}

	if (process.env.NO_CHROME_SANDBOX === '1') {
		opts.sandbox = false
	}

	return launch(opts)
}
