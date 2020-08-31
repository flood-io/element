import {
	step,
	TestSettings,
	Until,
	By,
	MouseButtons,
	Device,
	Driver,
	ENV,
	TestData,
} from '@flood/element'
import * as assert from 'assert'

export const settings: TestSettings = {
	loopCount: 1,
	device: Device.iPadLandscape,
	clearCache: true,
	disableCache: true,
	actionDelay: '0.5s',
	stepDelay: '2.5s',
	screenshotOnFailure: true,
	userAgent: 'flood-element-test',
}

type Row = { grid: string; gridFriendly: string }
let data = TestData.fromCSV<Row>('data.csv').shuffle()

/**
 * dogfooder
 * Version: 1.0
 */
export default () => {
	step('001 Flood.io', async (browser: Driver) => {})
}
