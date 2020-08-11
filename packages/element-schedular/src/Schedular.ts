import { TestSettings, EvaluatedScript, launchWithoutPage } from '@flood/element-core'
import { WorkerPool } from './WorkerPool'
import { ChildMessages } from './types'
import { assertIsValidateStages } from './assertIsValidateStages'
import { Plan } from './Plan'

export class Schedular {
	constructor(public settings: TestSettings) {}

	public async run(_testScript: EvaluatedScript) {
		const stages = this.settings.stages
		assertIsValidateStages(stages)

		// const testScript = await testScriptFactory()

		// this.timer = setInterval(this.updateTarget.bind(this), 1000)

		const browser = await this.launchBrowser()
		const plan = new Plan(stages)

		const pool = new WorkerPool({ maxRetries: 1, numWorkers: plan.maxUsers, setupArgs: [] })
		pool.stdout.pipe(process.stdout)
		pool.stderr.pipe(process.stderr)

		await plan.ticker(async (timestamp, target, total) => {
			console.log(`tick: ${timestamp}, delta: ${target} total: ${total}`)

			if (target == 1) {
				await pool.addWorker()
			} else if (target == -1) {
				await pool.removeLastWorker()
			} else {
				console.log('incorrect target', target)
			}

			const wsURL = browser.wsEndpoint()

			pool.sendEach(
				[ChildMessages.CALL, 'connect', [wsURL, _testScript.script.source]],
				worker => {
					console.log('worker start', worker.workerId)
				},
				err => {
					if (err) {
						console.log('worker error', err)
					} else {
						browser.kill()
						console.log('Success')
					}
				},
			)
		})

		// const browser = await this.launchBrowser()
		// for (let index = 0; index < threadCount; index++) {
		// 	const page = await browser.newPage()
		// 	await page.goto('https://challenge.flood.io')
		// 	console.log('Sleep')
		// 	await new Promise(yeah => setTimeout(yeah, 1e3))
		// }

		// await pool.waitForExit()
		// await new Promise(yeah => setTimeout(yeah, 1e3))
		// await browser.close()

		// process.on('SIGQUIT', async () => {
		// 	await browser.close()
		// })

		// process.on('SIGINT', async () => {
		// 	await browser.close()
		// })

		// process.once('SIGUSR2', async () => {
		// 	await browser.close()
		// 	process.kill(process.pid, 'SIGUSR2')
		// })
	}

	public async stop() {
		return null
	}

	public async launchBrowser() {
		const browser = await launchWithoutPage({ headless: false })
		// for (const page of await browser.pages()) {
		// 	await page.close()
		// }
		return browser
	}
}
