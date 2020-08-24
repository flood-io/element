import {
	TestSettings,
	launchBrowserServer,
	RuntimeEnvironment,
	BROWSER_TYPE,
} from '@flood/element-core'
import { WorkerPool } from './WorkerPool'
import { ActionConst, ChildMessages, WorkerInterface } from './types'
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

		const wsURL = this.browserServer.wsEndpoint()
		const rootEnv = this.env.workRoot.getRoot()
		const testData = this.env.workRoot.getSubRoot('test-data')

		const pool = new WorkerPool({
			maxRetries: 1,
			numWorkers: plan.maxUsers,
			setupArgs: [wsURL, rootEnv, testData, JSON.stringify(this.settings)],
		})
		pool.stdout.pipe(process.stdout)
		pool.stderr.pipe(process.stderr)

		const waitForExit = () => pool.waitForExit().then(this.stop)

		let workingWorker: string[] = []
		await plan.ticker(
			async (timestamp, target, stageIterator) => {
				console.log('\n========================================\n')
				console.log(`Run ${target} user${target > 1 ? 's' : ''} - Timestamp ${timestamp}ms`)

				pool.sendEachTarget(
					target,
					[ChildMessages.CALL, ActionConst.RUN, [testScript, stageIterator]],
					worker => {
						console.log(`[${worker.workerName}] starts`)
						workingWorker.push(worker.workerId)
					},
					(err, result, iterator) => {
						const worker = result as WorkerInterface
						if (err) {
							console.log(`[${worker.workerName}] has error: `, err)
						} else {
							console.log(`[${worker.workerName}] has completed the test`)
							worker.shutdown()
						}
						if (iterator === stages.length - 1) waitForExit()
					},
				)

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
			},
			async () => {
				for (const workerId of workingWorker) {
					await pool.removeWorker(workerId)
				}
			},
			async () => {
				return new Promise(resolve => {
					for (let i = 0; i < workingWorker.length; i++) {
						pool.addWorker()
					}
					workingWorker = []
					pool.waitForLoaded().then(resolve)
				})
			},
		)
	}

	stop = async () => {
		await this.browserServer.kill()
		process.exit(0)
	}
}