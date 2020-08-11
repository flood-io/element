import { Worker } from 'worker_threads'
import { EventEmitter } from 'events'
import {
	MessagePort,
	MessagePayload,
	ReplyPayload,
	MessageEvent,
	Messages,
	Reply,
	ReplyError,
} from './types'

type CallbackResponse = {
	resolve: (result: any) => void
	reject: (err: Error, message: string) => void
	error?: Error
	message?: any
}

export enum ProtocolInstruction {
	CLOSE,
}

export class WorkerConnection extends EventEmitter {
	private lastId = 0
	private callbacks: Map<number, CallbackResponse>
	private closed = false

	constructor(private thread: Worker | MessagePort) {
		super()
		this.callbacks = new Map()
		thread.on('message', this.onMesssage.bind(this))
		thread.once('exit', this.dispose.bind(this))
	}

	public async send<RT = unknown>(message: MessagePayload) {
		const id = this.rawSend(message)

		return new Promise<RT>((resolve, reject) => {
			this.callbacks.set(id, { resolve, reject })
		})
	}

	public dispose() {
		this.rawSend(ProtocolInstruction.CLOSE)
		this.onClose()
	}

	private rawSend(message: any): number {
		console.debug(`<<<`, message)
		const id = ++this.lastId
		this.thread.postMessage([id, message])
		return id
	}

	private onMesssage([id, message]: [number | null, ReplyPayload]) {
		const callback = id != null && this.callbacks.get(id)
		// Callbacks could be all rejected if someone has called `.dispose()`.
		if (callback && typeof id === 'number') {
			console.debug(`>>>`, id, message)
			this.callbacks.delete(id)

			const [type, ...args] = message
			if (type === Reply.ERROR) {
				const [, ctor, msg, stack] = message as ReplyError
				const NativeCtor = global[ctor as string]
				const Ctor = typeof NativeCtor === 'function' ? NativeCtor : Error
				const error = new Ctor(msg)
				error.type = name
				error.stack = stack
				callback.reject(error, msg as string)
			} else {
				callback.resolve(args)
			}
		} else if (id == null) {
			console.debug(`>EV`, message)
			const [eventName, data] = message as MessageEvent
			this.emit(eventName, data)
		}
	}

	private onClose() {
		if (this.closed) return
		this.closed = true
		this.thread.removeAllListeners()
		for (const callback of this.callbacks.values())
			callback.reject(callback.error || new Error(), `Protocol error: Worker closed.`)
		this.callbacks.clear()
	}
}
