import { readdirSync } from 'fs'
import { join } from 'path'
import { ensureDirSync } from 'fs-extra'

// /data/flood/files/lock/browser_N
const lockdirPath = join(process.env.FLOOD_DATA_ROOT || '/data/flood', 'files/lock')

// NOTE that this is a hack to be replaced ASAP by aggregating a `thread` tag with concurrency metrics
// https://github.com/flood-io/grid/blob/feature/go/static/kapacitor/measurements.tick#L175
export function numberOfBrowsers(): number {
	ensureDirSync(lockdirPath)

	try {
		const lockFiles = readdirSync(lockdirPath)
		return lockFiles.length
	} catch (err) {
		return 1
	}
}
