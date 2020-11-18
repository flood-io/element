import { ChildMessage, OnStart, OnEnd, WorkerInterface, ChildMessages, onReport } from './types'
import { Worker, WorkerOptions } from './Worker'
import mergeStream from 'merge-stream'
import faker from 'faker'

const FORCE_EXIT_DELAY = 500

export type WorkerPoolOptions = {
	setupArgs: Array<unknown>
	maxRetries: number
	numWorkers: number
}

export type PoolExitResult = {
	forceExited: boolean
}

const identityFn = () => {
	return
}

interface MergedStream extends NodeJS.ReadWriteStream {
	add(source: NodeJS.ReadableStream | ReadonlyArray<NodeJS.ReadableStream>): MergedStream
	isEmpty(): boolean
}

export class WorkerPool {
	private readonly workers: Array<WorkerInterface>
	public readonly stderr: MergedStream
	public readonly stdout: MergedStream

	constructor(public options: WorkerPoolOptions) {
		this.workers = []

		const stdout = mergeStream()
		const stderr = mergeStream()

		this.stdout = stdout
		this.stderr = stderr

		for (let i = 0; i < options.numWorkers; i++) {
			this.addWorker()
		}
	}

	addWorker(workerName?: string) {
		const id = faker.random.uuid()
		const name = workerName || `User ${this.workers.length}`
		const { maxRetries } = this.options

		const workerOptions: WorkerOptions = {
			maxRetries,
			workerId: id,
			workerName: name,
			args: this.options.setupArgs,
		}

		const worker = this.createWorker(workerOptions)
		const workerStdout = worker.getStdout()
		const workerStderr = worker.getStderr()

		if (workerStdout) {
			this.stdout.add(workerStdout)
		}

		if (workerStderr) {
			this.stderr.add(workerStderr)
		}

		this.workers.push(worker)
	}

	async endWorker(worker: WorkerInterface): Promise<boolean> {
		worker.send([ChildMessages.END, false], identityFn, identityFn)

		let forceExited = false
		const forceExitTimeout = setTimeout(() => {
			worker.forceExit()
			forceExited = true
		}, FORCE_EXIT_DELAY)

		await worker.waitForExit()
		clearTimeout(forceExitTimeout)
		return forceExited
	}

	async removeWorker(id: string): Promise<boolean> {
		const worker = this.getWorkerById(id)
		if (worker == null) return false

		const forceExited = await this.endWorker(worker)
		this.workers.splice(this.workers.indexOf(worker), 1)
		return forceExited
	}

	send(workerId: string, request: ChildMessage, onStart: OnStart, onEnd: OnEnd): void {
		this.getWorkerById(workerId).send(request, onStart, onEnd)
	}

	sendEach(request: ChildMessage, onStart: OnStart, onEnd: OnEnd): void {
		this.workers.forEach(worker => {
			worker.send(request, onStart, onEnd)
		})
	}

	sendEachTarget(
		target: number,
		request: ChildMessage,
		onStart: OnStart,
		onEnd: OnEnd,
		onReport?: onReport,
	): void {
		for (let i = 0; i < target; i++) {
			this.workers[i].send(request, onStart, onEnd, onReport)
		}
	}

	createWorker(workerOptions: WorkerOptions): WorkerInterface {
		return new Worker(workerOptions)
	}

	async waitForExit(): Promise<void> {
		await Promise.all(this.workers.map(worker => worker.waitForExit()))
	}

	async waitForLoaded(): Promise<void> {
		await Promise.all(this.workers.map(worker => worker.waitForLoaded()))
	}

	async end(): Promise<PoolExitResult> {
		const workerExitPromises = this.workers.map(async worker => this.endWorker(worker))

		const workerExits = await Promise.all(workerExitPromises)
		return workerExits.reduce<PoolExitResult>(
			(result, forceExited) => ({
				forceExited: result.forceExited || forceExited,
			}),
			{ forceExited: false },
		)
	}

	private getWorkerById(id: string): WorkerInterface {
		return this.workers.filter(worker => worker.workerId === id)[0]
	}
}
