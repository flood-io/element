import 'mocha'
import { use, expect } from 'chai'
import * as SinonChai from 'sinon-chai'
import { DogfoodServer } from '../../tests/support/fixture-server'
import testRunEnv from '../../tests/support/test-run-env'
import { launchPuppeteer, testPuppeteer } from '../../tests/support/launch-browser'
import Test from './Test'
import { mustCompileFile } from '../TestScript'
import { join } from 'path'
import { EventEmitterReporter } from '../reporter/EventEmitter'
use(SinonChai)

let dogfoodServer = new DogfoodServer()
let test: Test
let puppeteer: testPuppeteer
let testReporter: EventEmitterReporter = new EventEmitterReporter()
const runEnv = testRunEnv()

// function ensureDefined(value: any | undefined | null): any | never {
// if (value === undefined || value === null) {
// throw new Error('value was not defined')
// } else {
// return value
// }
// }

const setupTest = async (scriptName: string) => {
	let script = await mustCompileFile(join(__dirname, '../../tests/fixtures', scriptName))
	test.enqueueScript(script, {})

	await test.beforeRun()
}

describe('Test', function() {
	this.timeout(30e3)
	beforeEach(async () => {
		puppeteer = await launchPuppeteer()
		testReporter = new EventEmitterReporter()
		test = new Test(puppeteer, runEnv, testReporter)
	})

	afterEach(async () => {
		await puppeteer.close()
	})

	before(async () => {
		await dogfoodServer.start()
	})

	after(async () => {
		await dogfoodServer.close()
	})

	it('extracts settings during evaluation', async () => {
		await setupTest('test-with-export.ts')
		expect(test.settings).to.deep.equal({
			actionDelay: 5,
			stepDelay: 0,
			clearCache: false,
			device: 'Chrome Desktop Large',
			chromeVersion: 'puppeteer',
			ignoreHTTPSErrors: false,
			userAgent:
				'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.186 Safari/537.36',
			clearCookies: true,
			duration: -1,
			loopCount: Infinity,
			name: 'Example Test',
			description: 'This is an example test',
			screenshotOnFailure: true,
			waitTimeout: 30,
			responseTimeMeasurement: 'step',
			consoleFilter: [],
		})
	})

	it('parses steps', async () => {
		await setupTest('test-with-export.ts')

		expect(test.steps.map(step => step.name)).to.deep.equal(['Invalid Step', 'Test Step'])
	})

	it('runs steps', async () => {
		await setupTest('test-with-export.ts')

		await test.run()
	}).timeout(30e3)
})
