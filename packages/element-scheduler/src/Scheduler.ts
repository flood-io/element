import {
	TestSettings,
	launchBrowserServer,
	RuntimeEnvironment,
	BrowserType,
} from '@flood/element-core'
import { WorkerPool } from './WorkerPool'
import { ActionConst, ChildMessages, WorkerInterface } from './types'
import { assertIsValidateStages } from './assertIsValidateStages'
import { Plan } from './Plan'
import { BrowserServer } from 'playwright'
import { ITERATION, MEASUREMENT } from '@flood/element-report'
import chalk from 'chalk'
import Table from 'cli-table3'

export type SchedulerSetting = TestSettings & {
	headless?: boolean | undefined
	browser?: BrowserType
	sandbox?: boolean | undefined
	verbose?: boolean
}

type TableDataConfig = {
	worker: { id: string; name: string; iteration: string }
	response_time?: string
	latency?: string
	throughput?: string
	transaction_rate?: string
	passed?: string
	failed?: string
	skipped?: string
	unexecuted?: string
}

export class Scheduler {
	constructor(public env: RuntimeEnvironment, public settings: SchedulerSetting) {}

	private browserServer: BrowserServer
	private spinnies: any

	public setSpinnies(spinnies: any): void {
		this.spinnies = spinnies
	}

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
		let dataTable: TableDataConfig[] = []

		const onTicker = async (
			timestamp: number,
			target: number,
			stageIterator: number,
		): Promise<void> => {
			if (stageIterator > 0) {
				console.log('\n========================================\n')
			} else {
				this.spinnies.succeed('initializing', {
					text: chalk.whiteBright('Initialized successfully\n'),
				})
			}

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
			dataTable = []

			const onWorkerStart = (worker: WorkerInterface) => {
				workingWorkers.push(worker)
			}

			const onWorkerEnd = (
				err: Error | null,
				worker: WorkerInterface,
				iterator: number,
				next: any,
			): void => {
				worker.shutdown()
				if (err) {
					errorWorkers.push(worker.waitForExit())
					console.log(`[${worker.workerName}] has error: `, err)
				} else {
					doneWorkers++
				}

				if (iterator === stages.length - 1) waitForExit()
				if (workingWorkers.length === errorWorkers.length) {
					Promise.all(errorWorkers).then(next)
				}
				const { text } = this.spinnies.pick(worker.workerId)
				this.spinnies.succeed(worker.workerId, { text: chalk.whiteBright(text) })
				if (doneWorkers === workingWorkers.length) {
					const head: string[] = [
						chalk.whiteBright('User'),
						chalk.white('Iteration'),
						chalk.blue('Response Time\nms'),
						chalk.yellow('Latency\nms'),
						chalk.magenta('Throughput\nkbps'),
						chalk.greenBright('Transaction rate\nrpm'),
						chalk.green('Passed'),
						chalk.red('Failed'),
						chalk.yellowBright('Skipped'),
						chalk.white('Unexecuted'),
					]
					const table = new Table({
						head,
						colAligns: [
							'center',
							'center',
							'center',
							'center',
							'center',
							'center',
							'center',
							'center',
							'center',
							'center',
						],
						rowAligns: [
							'top',
							'center',
							'center',
							'center',
							'center',
							'center',
							'top',
							'top',
							'top',
							'top',
						],
					})

					dataTable.sort((a, b) =>
						a.worker.name > b.worker.name ? 1 : a.worker.name < b.worker.name ? -1 : 0,
					)
					const rowSpans: { rowSpan: number; id: string }[] = []
					for (const row of dataTable) {
						const {
							worker,
							response_time: responseTime = '0',
							latency = '0',
							throughput = '0',
							transaction_rate: transactionRate = '0',
							passed = '0',
							failed = '0',
							skipped = '0',
							unexecuted = '0',
						} = row
						const hasGroup = rowSpans.some(row => row.id === worker.id)
						const data = [
							chalk.white(worker.iteration),
							chalk.blue(responseTime),
							chalk.yellow(latency),
							chalk.magenta(throughput),
							chalk.greenBright(transactionRate),
							chalk.green(passed),
							chalk.red(failed),
							chalk.yellowBright(skipped),
							chalk.white(unexecuted),
						]
						if (hasGroup) {
							table.push(data)
						} else {
							const rowSpan = this.settings.loopCount || 0
							rowSpans.push({ rowSpan, id: row.worker.id })
							table.push([{ rowSpan, content: worker.name, vAlign: 'center' }, ...data])
						}
					}
					console.log(table.toString())
					next()
				}
			}

			const reportedWorker: string[] = []
			let iterationInfo = ''
			const sortedUsers: { id: string; name: string; order: string }[] = []
			const onWorkerReport = (worker: WorkerInterface, data: string[]): void => {
				const { workerName, workerId } = worker
				const [msg, type] = data
				const userAlias = sortedUsers.find(user => user.id === workerId)
				let order = `User ${sortedUsers.length + 1}`
				if (!userAlias) {
					sortedUsers.push({
						id: workerId,
						name: workerName,
						order,
					})
				} else {
					order = userAlias.order
				}

				if (type === ITERATION) {
					const { iterationMsg, iteration } = JSON.parse(msg)
					iterationInfo = chalk.italic.grey(iterationMsg)
					dataTable.push({
						worker: { id: workerId, name: order, iteration },
					})
				}

				if (type === MEASUREMENT) {
					const { name, value, iteration } = JSON.parse(msg)
					const row = dataTable.filter(
						row => row.worker.id === workerId && `${row.worker.iteration}` === `${iteration}`,
					)
					row[0][name] = value
					return
				}

				const text = `${chalk.bold(order)}  ${iterationInfo}   ${type === ITERATION ? '' : msg}`

				if (!reportedWorker.includes(workerId)) {
					this.spinnies.add(workerId, { text })
					reportedWorker.push(workerId)
				} else {
					this.spinnies.update(workerId, { text })
				}
			}

			return new Promise(next => {
				pool.sendEachTarget(
					target,
					[ChildMessages.CALL, ActionConst.RUN, [testScript, stageIterator]],
					onWorkerStart,
					(err, result, iterator) => onWorkerEnd(err, result as WorkerInterface, iterator, next),
					onWorkerReport,
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
