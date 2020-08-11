import { isMainThread, parentPort, MessagePort, workerData } from 'worker_threads'
import { WorkerData, ChildMessage, Instruction, InstructionPayload } from '../types'

import { ThreadConnection } from '../ThreadConnection'
import { ElementWorker } from './ElementWorker'

class ThreadInternal {
	private connection: ThreadConnection<any, any>
	private internalWorker: ElementWorker
	private workerId: number
	private workerPromise: Promise<void>

	constructor(private port: MessagePort, data: WorkerData) {
		if (isMainThread) {
			throw new Error('Thread internal can only be used on a forked process')
		}

		console.log(data)

		// port?.on('message', this.messageHandler.bind(this))
		// port?.on('close', this.handleClose.bind(this))
		// port?.ref()

		this.connection = new ThreadConnection<ChildMessage, any>(port, this.messageHandler.bind(this))
		this.connection.emit('example', {})
	}

	async messageHandler(request: InstructionPayload, reply: (response: any) => void): Promise<any> {
		// if (request?.timestamp) console.log(`Latency:`, now - request?.timestamp?.valueOf())

		const typeName = Instruction[request.type]
		console.log(`message: ${typeName}`)

		switch (request.type) {
			case Instruction.INIT: {
				this.workerId = request.workerId
				reply(true)
				break
			}

			case Instruction.CONNECT: {
				this.internalWorker = new ElementWorker(this.workerId?.toString(), request.options)
				break
			}

			case Instruction.START: {
				this.workerPromise = this.internalWorker.start()
				break
			}

			case Instruction.STOP: {
				await this.internalWorker.stop()
				break
			}

			case Instruction.END: {
				console.debug('Worker thread will exit')
				this.handleClose()
				return true
			}

			default: {
				console.log(`Unsupported command:`, request)
			}
		}
	}

	handleClose() {
		this.connection.dispose()
		this.port?.unref()
		this.port?.removeAllListeners()
	}

	// reportSuccess(result: any) {
	// 	if (isMainThread) {
	// 		throw new Error('Child can only be used on a forked process')
	// 	}

	// 	parentPort?.postMessage({ type: Reply.READY, result })
	// }

	// reportError(error: Error, type: Reply = Reply.CLIENT_ERROR) {
	// 	// if (isMainThread) {
	// 	// 	throw new Error('Child can only be used on a forked process')
	// 	// }
	// 	// if (error == null) {
	// 	// 	error = new Error('"null" or "undefined" thrown')
	// 	// }
	// 	// parentPort?.postMessage({
	// 	// 	type,
	// 	// 	constructor: error.constructor && error.constructor.name,
	// 	// 	message: error.message,
	// 	// 	stack: error.stack,
	// 	// 	extra: typeof error === 'object' ? { ...error } : error,
	// 	// })
	// }
}

if (parentPort) new ThreadInternal(parentPort, workerData)
