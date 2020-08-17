import {
	TestSettings,
	launchBrowserServer,
	RuntimeEnvironment,
	BROWSER_TYPE,
} from '@flood/element-core'
import { WorkerPool } from './WorkerPool'
import { ChildMessages, WorkerInterface } from './types'
import { assertIsValidateStages } from './assertIsValidateStages'
import { Plan } from './Plan'
import { BrowserServer } from 'playwright'

type SchedularSetting = TestSettings & {
	headless?: boolean | undefined
	browserType?: BROWSER_TYPE
	sandbox?: boolean | undefined
}

export class Schedular {
	constructor(public env: RuntimeEnvironment, public settings: SchedularSetting) {}

	private browserServer: BrowserServer

	public async run(testScript: string) {
		const stages = this.settings.stages
		assertIsValidateStages(stages)

		this.browserServer = await launchBrowserServer(this.settings)
		const plan = new Plan(stages)

		const pool = new WorkerPool({
			maxRetries: 1,
			numWorkers: plan.maxUsers,
			setupArgs: [this.browserServer.wsEndpoint()],
		})
		pool.stdout.pipe(process.stdout)
		pool.stderr.pipe(process.stderr)

		await plan.ticker(async (timestamp, target, total) => {
			console.log(`tick: ${timestamp}, delta: ${target} total: ${total}`)

			const wsURL = this.browserServer.wsEndpoint()
			const rootEnv = this.env.workRoot.getRoot()
			const testData = this.env.workRoot.getSubRoot('test-data')

			pool.sendEach(
				[
					ChildMessages.CALL,
					'run',
					[wsURL, testScript, rootEnv, testData, JSON.stringify(this.settings)],
				],
				worker => {
					console.log(`Worker ${worker.workerId} starts`)
				},
				(err, result) => {
					const worker = result as WorkerInterface
					if (err) {
						console.log(`Worker '${worker.workerId}' has error: `, err)
					} else {
						console.log(`Worker '${worker.workerId}' has completed the test`)
						worker.shutdown()
					}
				},
			)

			pool.waitForExit().then(() => {
				this.stop()
			})

			process.on('SIGQUIT', async () => {
				this.stop()
				process.kill(process.pid, 'SIGUSR2')
			})

			process.on('SIGINT', async () => {
				this.stop()
				process.kill(process.pid, 'SIGUSR2')
			})

			process.once('SIGUSR2', async () => {
				this.stop()
				process.kill(process.pid, 'SIGUSR2')
			})
		})
	}

	public async stop() {
		await this.browserServer.kill()
		process.exit(0)
	}
}
