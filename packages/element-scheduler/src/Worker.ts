import {
	WorkerInterface,
	ChildMessages,
	ParentMessages,
	ParentMessage,
	ChildMessage,
	OnStart,
	OnEnd,
	ParentMessageError,
	ParentMessageOk,
	MessageConst,
	OnReport,
} from './types'
import { join } from 'path'
import { Worker as WorkerThread } from 'worker_threads'
import { PassThrough } from 'stream'
import mergeStream from 'merge-stream'
import { Page } from 'playwright'
import { WorkerConnection } from './WorkerConnection'
import debugFactory from 'debug'
const debug = debugFactory('element:worker')

export type WorkerOptions = {
	page?: Promise<Page>
	maxRetries: number
	workerId: string
	workerName: string
	args: unknown[]
}

export class Worker implements WorkerInterface {
	private worker: WorkerThread

	private fakeStream: PassThrough | null
	private stdout?: ReturnType<typeof mergeStream>
	private stderr?: ReturnType<typeof mergeStream>

	private retries = 0
	private onProcessEnd: OnEnd
	private onProcessReport: OnReport

	private exitPromise: Promise<void>
	private resolveExitPromise!: () => void

	private loadPromise: Promise<void>
	private resolveLoadPromise: () => void

	public forceExited: boolean
	public connection: WorkerConnection

	constructor(public options: WorkerOptions) {
		this.fakeStream = new PassThrough()

		this.exitPromise = new Promise((resolve) => {
			this.resolveExitPromise = resolve
		})

		this.loadPromise = new Promise((resolve) => {
			this.resolveLoadPromise = resolve
		})

		this.initializeWorkerThread()
		this.connection = new WorkerConnection(this.worker)
	}

	private initializeWorkerThread(): void {
		const isTS = __filename.endsWith('.ts')
		const workerFile = isTS
			? join(__dirname, './workers/worker-import.js')
			: join(__dirname, './workers/threadChild.js')
		const [wsEndpoint, rootEnv, testData, settings] = this.options.args

		this.worker = new WorkerThread(workerFile, {
			eval: false,
			stderr: true,
			stdout: true,
			workerData: {
				cwd: process.cwd(),
				env: {
					...process.env,
					workerId: this.options.workerId,
					workerName: this.options.workerName,
					wsEndpoint,
					rootEnv,
					testData,
					settings,
				} as NodeJS.ProcessEnv,
				silent: false,
			},
		})

		if (this.worker.stdout && this.fakeStream) {
			if (!this.stdout) {
				this.stdout = mergeStream(this.fakeStream)
			}

			this.stdout.add(this.worker.stdout)
		}

		if (this.worker.stderr && this.fakeStream) {
			if (!this.stderr) {
				this.stderr = mergeStream(this.fakeStream)
			}

			this.stderr.add(this.worker.stderr)
		}

		this.worker.on('message', this.onMessage)
		this.worker.on('exit', this.onExit)
		this.worker.on('error', (err) => console.error(err))
		this.worker.on('online', () => {})

		this.worker.postMessage([ChildMessages.INITIALIZE, false])

		this.retries++

		if (this.retries > this.options.maxRetries) {
			const error = new Error('Call retries were exceeded')

			this.onMessage([
				ParentMessages.CLIENT_ERROR,
				error.name,
				error.message,
				error.stack || '',
				{ type: 'WorkerError' },
			])
		}
	}

	private onMessage = async (response: ParentMessage): Promise<void> => {
		const [type] = response

		switch (type) {
			case ParentMessages.OK: {
				const [, result, data] = response as ParentMessageOk
				if (result === MessageConst.RUN_COMPLETED) {
					this.onProcessEnd(null, this, data[0] as number)
				} else if (result === MessageConst.LOADED) {
					this.resolveLoadPromise()
				} else if (result === MessageConst.REPORT) {
					this.onProcessReport(this, data as string[])
				}
				break
			}

			case ParentMessages.CLIENT_ERROR: {
				const [, name, message, stack, stageIterator] = response as ParentMessageError
				const NativeCtor = global[name]
				const Ctor = typeof NativeCtor === 'function' ? NativeCtor : Error
				const error = new Ctor(message)
				error.type = name
				error.stack = stack

				this.onProcessEnd(error, this, stageIterator as number)
				break
			}

			case ParentMessages.SETUP_ERROR: {
				const error = new Error('Setup Error')
				this.onProcessEnd(error, this, 0)
				break
			}

			default:
				throw new TypeError(`Unexpected response from worker: ${type}`)
		}
	}

	private onExit = (exitCode: number): void => {
		debug(`exit code: ${exitCode}`)
		this.resolveExitPromise()
	}

	waitForExit(): Promise<void> {
		return this.exitPromise
	}

	waitForLoaded(): Promise<void> {
		return this.loadPromise
	}

	forceExit(): void {
		this.forceExited = true
		this.worker.terminate()
	}

	send(
		request: ChildMessage,
		onProcessStart: OnStart,
		onProcessEnd: OnEnd,
		onProcessReport: OnReport
	): void {
		onProcessStart(this)
		this.onProcessEnd = (...args) => onProcessEnd(...args)
		if (onProcessReport) this.onProcessReport = (...args) => onProcessReport(...args)

		this.retries = 0

		this.worker.postMessage(request)
	}

	get workerId(): string {
		return this.options.workerId
	}

	get workerName(): string {
		return this.options.workerName
	}

	getStdout(): NodeJS.ReadableStream | null {
		return this.stdout || null
	}

	getStderr(): NodeJS.ReadableStream | null {
		return this.stderr || null
	}

	shutdown(): void {
		if (this.fakeStream) {
			this.fakeStream.end()
			this.fakeStream = null
		}

		this.connection.dispose()
		this.resolveExitPromise()
	}
}
