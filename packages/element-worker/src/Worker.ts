import { Worker } from 'worker_threads'
import { join } from 'path'
import { WorkerInterface, Instruction, MergeStream, OnEnd, WorkerData } from './types'
import { PassThrough } from 'stream'
import mergeStream from 'merge-stream'
import { WorkerConnection } from './WorkerConnection'
import { performance } from 'perf_hooks'

let workerId = 0

export default class NodeWorker implements WorkerInterface {
	public workerId: number
	public stdout: MergeStream | null
	public stderr: MergeStream | null

	private worker: Worker
	private fakeStream: PassThrough | null

	// DEPRECATED
	private exitPromise: Promise<void>
	private initPromise: Promise<void>
	private resolveExitPromise: () => void
	private resolveInitPromise: () => void
	private forceExited: boolean
	private onProcessEnd: OnEnd

	private connection: WorkerConnection

	constructor() {
		this.workerId = ++workerId
		this.fakeStream = new PassThrough()

		this.initPromise = new Promise(resolve => {
			this.resolveInitPromise = resolve
		})

		this.exitPromise = new Promise(resolve => {
			this.resolveExitPromise = resolve
		})

		this.initializeWorkerThread()
	}

	private initializeWorkerThread() {
		const st = performance.now()
		const isTS = __filename.endsWith('.ts')
		const workerFile = isTS
			? join(__dirname, './worker/tsWorkerLoader.js')
			: join(__dirname, './worker/entry.js')

		this.worker = new Worker(workerFile, {
			eval: false,
			stderr: true,
			stdout: true,
			workerData: {
				cwd: process.cwd(),
				env: {
					...process.env,
					ELEMENT_WORKER_ID: String(this.workerId),
				} as NodeJS.ProcessEnv,
				silent: false,
			} as WorkerData,
		})

		// this.connection = new WorkerConnection(this.worker)

		if (this.worker.stdout && this.fakeStream) {
			if (!this.stdout) {
				// We need to add a permanent stream to the merged stream to prevent it
				// from ending when the subprocess stream ends
				this.stdout = mergeStream(this.fakeStream)
			}

			this.stdout.add(this.worker.stdout)
		}

		if (this.worker.stderr && this.fakeStream) {
			if (!this.stderr) {
				// We need to add a permanent stream to the merged stream to prevent it
				// from ending when the subprocess stream ends
				this.stderr = mergeStream(this.fakeStream)
			}

			this.stderr.add(this.worker.stderr)
		}

		this.worker.on('message', this.onMessage.bind(this))
		this.worker.on('error', this.onError.bind(this))
		this.worker.once('exit', this.onExit.bind(this))
		this.worker.once('online', () => {
			console.log('online')
		})

		this.send(Instruction.INIT)

		// this.retries++

		// If we exceeded the amount of retries, we will emulate an error reply
		// coming from the child. This avoids code duplication related with cleaning
		// the queue, and scheduling the next call.
		// if (this.retries > this.options.maxRetries) {
		// 	const error = new Error('Call retries were exceeded')

		// 	this.onMessage([
		// 		ParentMessages.CLIENT_ERROR,
		// 		error.name,
		// 		error.message,
		// 		error.stack!,
		// 		{ type: 'WorkerError' },
		// 	])
		// }
	}

	start() {
		this.send(Instruction.START)
	}

	stop() {
		this.send(Instruction.STOP)
	}

	send(inst: Instruction, args?: any): any {
		// return this.connection.send([inst, data])
		this.worker.postMessage([inst, ...args])
	}

	waitForExit(): Promise<void> {
		return this.exitPromise
	}

	waitForInit(): Promise<void> {
		return this.initPromise
	}

	async exit(): Promise<void> {
		await this.send(Instruction.END)
		return this.waitForExit()
	}

	forceExit(): void {
		this.forceExited = true
		this.shutdown()
		this.worker.terminate()
	}

	private onMessage(raw: any) {}

	private onError = async (err: Error) => {
		console.error(`Worker ERROR:`, err)
	}

	private onExit = (exitCode: number) => {
		console.log(`Worker exit: ${exitCode}`)

		if (exitCode !== 0 && !this.forceExited) {
			console.log('TOOD: Rtry here')
		} else {
			this.shutdown()
		}
	}

	private shutdown() {
		// End the permanent stream so the merged stream end too
		if (this.fakeStream) {
			this.fakeStream.end()
			this.fakeStream = null
		}

		this.connection.dispose()

		this.resolveExitPromise()
	}
}
