import { readdirSync } from 'fs'
import { join } from 'path'

const lockdirPath = join(process.env.FLOOD_DATA_ROOT ?? '/data/flood', 'lock', 'concurrency.lock')

// NOTE that this is a hack to be replaced ASAP by aggregating a `thread` tag with concurrency metrics
// https://github.com/flood-io/grid/blob/feature/go/static/kapacitor/measurements.tick#L175
export function numberOfBrowsers(): number {
	try {
		const lockFiles = readdirSync(lockdirPath)
		return lockFiles.length
	} catch (err) {
		console.error('failed to get number of browsers', err)
		return 1
	}
}
