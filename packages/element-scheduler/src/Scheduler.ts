import {
	TestSettings,
	launchBrowserServer,
	RuntimeEnvironment,
	BROWSER_TYPE,
} from '@flood/element-core'
import { WorkerPool } from '@flood/element-scheduler/src/WorkerPool'
import { ActionConst, ChildMessages, WorkerInterface } from '@flood/element-scheduler/src/types'
import { assertIsValidateStages } from '@flood/element-scheduler/src/assertIsValidateStages'
import { Plan } from '@flood/element-scheduler/src/Plan'
import { BrowserServer } from 'playwright'

type SchedulerSetting = TestSettings & {
	headless?: boolean | undefined
	browserType?: BROWSER_TYPE
	sandbox?: boolean | undefined
}

export class Scheduler {
	constructor(public env: RuntimeEnvironment, public settings: SchedulerSetting) {}

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
		let workingWorkers: WorkerInterface[] = []

		const onTicker = async (
			timestamp: number,
			target: number,
			stageIterator: number,
		): Promise<void> => {
			console.log('\n========================================\n')
			console.log(
				`Run ${target} user${target > 1 || target === 0 ? 's' : ''} | Duration ${timestamp}ms`,
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

			let doneWorkers = 0
			const errorWorkers: Promise<void>[] = []

			const onWorkerStart = (worker: WorkerInterface) => {
				console.log(`[${worker.workerName}] starts`)
				workingWorkers.push(worker)
			}

			const onWorkerEnd = (
				err: Error | null,
				worker: WorkerInterface,
				iterator: number,
				next: any,
			) => {
				worker.shutdown()
				if (err) {
					errorWorkers.push(worker.waitForExit())
					console.log(`[${worker.workerName}] has error: `, err)
				} else {
					doneWorkers++
					console.log(`[${worker.workerName}] has completed the test`)
				}

				if (iterator === stages.length - 1) waitForExit()
				if (workingWorkers.length === errorWorkers.length) {
					Promise.all(errorWorkers).then(next)
				}
				if (doneWorkers === workingWorkers.length) next()
			}

			return new Promise(next => {
				pool.sendEachTarget(
					target,
					[ChildMessages.CALL, ActionConst.RUN, [testScript, stageIterator]],
					onWorkerStart,
					(err, result, iterator) => onWorkerEnd(err, result as WorkerInterface, iterator, next),
				)
			})
		}

		const onEndStage = async (): Promise<void> => {
			for (const worker of workingWorkers) {
				await pool.removeWorker(worker.workerId)
			}
		}

		const onNewStage = async (): Promise<void> => {
			return new Promise(resolve => {
				for (let i = 0; i < workingWorkers.length; i++) {
					pool.addWorker(workingWorkers[i].workerName)
				}
				workingWorkers = []
				pool.waitForLoaded().then(resolve)
			})
		}

		await plan.ticker(onTicker, onEndStage, onNewStage)
	}

	stop = async () => {
		await this.browserServer.kill()
		process.exit(0)
	}
}
