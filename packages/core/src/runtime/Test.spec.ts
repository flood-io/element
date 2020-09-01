import { serve } from '../../tests/support/fixture-server'
import testRunEnv from '../../tests/support/test-run-env'
import { launchPlaywright, testPlaywright } from '../../tests/support/launch-browser'
import Test from './Test'
import { EvaluatedScript } from './EvaluatedScript'
import { join } from 'path'
import { EventEmitterReporter } from '../reporter/EventEmitter'
import { ConcreteTestSettings, normalizeSettings, TestSettings } from './Settings'
import { readFileSync, writeFileSync } from 'fs-extra'
import { tmpdir } from 'os'
import { BROWSER_TYPE } from '../page/types'

let playwright: testPlaywright
let testReporter: EventEmitterReporter = new EventEmitterReporter()
const runEnv = testRunEnv()

const setupTest = async (scriptName: string) => {
	const url = await serve('wait.html')

	let testScriptFile = readFileSync(join(__dirname, '../../tests/fixtures', scriptName), {
		encoding: 'utf8',
	})

	testScriptFile = testScriptFile.replace('<URL>', url)
	const tmpFile = join(tmpdir(), 'test-script.ts')
	writeFileSync(tmpFile, testScriptFile)

	const script = await EvaluatedScript.mustCompileFile(tmpFile, runEnv)
	const test = new Test(playwright, script, testReporter, {})

	await test.beforeRun()
	return test
}

describe('Test', () => {
	jest.setTimeout(30e3)
	beforeEach(async () => {
		playwright = await launchPlaywright()
		testReporter = new EventEmitterReporter()
	})

	afterEach(async () => {
		await playwright.close()
	})

	test('extracts settings during evaluation', async () => {
		const test = await setupTest('test-with-export.ts')
		const defaultSettings: ConcreteTestSettings = {
			actionDelay: '500ms',
			stepDelay: '5s',
			clearCache: false,
			device: null,
			browserType: BROWSER_TYPE.CHROME,
			ignoreHTTPSError: false,
			userAgent: '',
			clearCookies: true,
			duration: -1,
			loopCount: Infinity,
			name: 'Example Test',
			description: 'This is an example test',
			screenshotOnFailure: true,
			waitTimeout: '30s',
			responseTimeMeasurement: 'step',
			consoleFilter: [],
			blockedDomains: [],
			incognito: false,
			waitUntil: false,
			disableCache: false,
			extraHTTPHeaders: {},
			launchArgs: [],
			viewport: null,
			tries: 0,
			stages: [],
		}
		expect(test.settings).toEqual(normalizeSettings(defaultSettings))
	})

	test('parses steps', async () => {
		const test = await setupTest('test-with-export.ts')

		expect(test.steps.map(step => step.name)).toEqual(['Invalid Step', 'Test Step'])
	})

	test('runs steps', async () => {
		const test = await setupTest('test-with-export.ts')

		await test.run()
	}, 30e3)
})
