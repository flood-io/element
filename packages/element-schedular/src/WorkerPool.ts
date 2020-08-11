import { ChildMessage, OnStart, OnEnd, WorkerInterface, ChildMessages } from './types'
import { Worker, WorkerOptions } from './Worker'
import mergeStream from 'merge-stream'

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
		this.workers = new Array(options.numWorkers)

		const stdout = mergeStream()
		const stderr = mergeStream()

		this.stdout = stdout
		this.stderr = stderr

		console.log(`number of worker ${options.numWorkers}`)
		for (let i = 0; i < options.numWorkers; i++) {
			this.addWorker()
		}
	}

	addWorker() {
		const id = this.workers.length
		const { maxRetries } = this.options

		const workerOptions: WorkerOptions = {
			maxRetries,
			workerId: id,
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

		this.workers[this.workers.length] = worker
	}

	async removeLastWorker() {
		const worker = this.workers[this.workers.length - 1]
		if (!worker) return false
		return this.removeWorker(worker.workerId)
	}

	async removeWorker(id: number): Promise<boolean> {
		const worker = this.getWorkerById(id)
		if (worker == null) return false

		worker.send([ChildMessages.END, false], identityFn, identityFn)
		// Schedule a force exit in case worker fails to exit gracefully so
		// await worker.waitForExit() never takes longer than FORCE_EXIT_DELAY
		let forceExited = false
		const forceExitTimeout = setTimeout(() => {
			worker.forceExit()
			forceExited = true
		}, FORCE_EXIT_DELAY)

		await worker.waitForExit()
		// Worker ideally exited gracefully, don't send force exit then
		clearTimeout(forceExitTimeout)

		this.workers.splice(id, 1)
		return forceExited
	}

	send(workerId: number, request: ChildMessage, onStart: OnStart, onEnd: OnEnd): void {
		this.getWorkerById(workerId).send(request, onStart, onEnd)
	}

	sendEach(request: ChildMessage, onStart: OnStart, onEnd: OnEnd): void {
		this.workers.forEach(worker => {
			worker.send(request, onStart, onEnd)
		})
	}

	createWorker(workerOptions: WorkerOptions): WorkerInterface {
		return new Worker(workerOptions)
	}

	async waitForExit(): Promise<void> {
		await Promise.all(this.workers.map(worker => worker.waitForExit()))
	}

	async end(): Promise<PoolExitResult> {
		// We do not cache the request object here. If so, it would only be only
		// processed by one of the workers, and we want them all to close.
		const workerExitPromises = this.workers.map(async worker => {
			worker.send([ChildMessages.END, false], identityFn, identityFn)

			// Schedule a force exit in case worker fails to exit gracefully so
			// await worker.waitForExit() never takes longer than FORCE_EXIT_DELAY
			let forceExited = false
			const forceExitTimeout = setTimeout(() => {
				worker.forceExit()
				forceExited = true
			}, FORCE_EXIT_DELAY)

			await worker.waitForExit()
			// Worker ideally exited gracefully, don't send force exit then
			clearTimeout(forceExitTimeout)

			return forceExited
		})

		const workerExits = await Promise.all(workerExitPromises)
		return workerExits.reduce<PoolExitResult>(
			(result, forceExited) => ({
				forceExited: result.forceExited || forceExited,
			}),
			{ forceExited: false },
		)
	}

	private getWorkerById(workerId: number): WorkerInterface {
		return this.workers[workerId]
	}
}
