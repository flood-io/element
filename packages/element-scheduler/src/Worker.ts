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
} from './types'
import { join } from 'path'
import { Worker as WorkerThread } from 'worker_threads'
import { PassThrough } from 'stream'
import mergeStream from 'merge-stream'
import { Page } from 'puppeteer'
import { WorkerConnection } from './WorkerConnection'

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

	private exitPromise: Promise<void>
	private resolveExitPromise!: () => void
	private forceExited: boolean

	private loadPromise: Promise<void>
	private resolveLoadPromise: () => void

	public connection: WorkerConnection

	constructor(public options: WorkerOptions) {
		this.fakeStream = new PassThrough()

		this.exitPromise = new Promise(resolve => {
			this.resolveExitPromise = resolve
		})

		this.loadPromise = new Promise(resolve => {
			this.resolveLoadPromise = resolve
		})

		this.initializeWorkerThread()
		this.connection = new WorkerConnection(this.worker)
	}

	private initializeWorkerThread() {
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
		console.debug(`Worker loaded: ${workerFile}`)

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
		this.worker.on('error', err => console.error(err))
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

	private onMessage = async (response: ParentMessage) => {
		const [type] = response

		switch (type) {
			case ParentMessages.OK: {
				const [, message] = response as ParentMessageOk
				if (message === MessageConst.RUN_COMPLETED) {
					this.onProcessEnd(null, this)
				} else if (message === MessageConst.LOADED) {
					this.resolveLoadPromise()
				}
				break
			}

			case ParentMessages.PAGE_CALL: {
				//do something
				break
			}

			case ParentMessages.CLIENT_ERROR: {
				const [, name, message, stack] = response as ParentMessageError

				const NativeCtor = global[name]
				const Ctor = typeof NativeCtor === 'function' ? NativeCtor : Error
				const error = new Ctor(message)
				error.type = name
				error.stack = stack

				this.onProcessEnd(error, null)
				break
			}

			case ParentMessages.SETUP_ERROR: {
				const error = new Error('Setup Error')
				this.onProcessEnd(error, null)
				break
			}
			default:
				throw new TypeError(`Unexpected response from worker: ${type}`)
		}
	}

	private onExit = (exitCode: number) => {
		console.log(`User ${this.workerName} exit: ${exitCode}`)

		if (exitCode !== 0 && !this.forceExited) {
			console.log(``)
		} else {
			this.shutdown()
		}
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

	send(request: ChildMessage, onProcessStart: OnStart, onProcessEnd: OnEnd): void {
		onProcessStart(this)
		this.onProcessEnd = (...args) => {
			return onProcessEnd(...args)
		}

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

	shutdown() {
		if (this.fakeStream) {
			this.fakeStream.end()
			this.fakeStream = null
		}

		this.connection.dispose()
		this.resolveExitPromise()
	}
}
