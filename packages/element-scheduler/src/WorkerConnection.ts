import { Worker, MessagePort } from 'worker_threads'

type CallbackResponse = {
	resolve: (result: any) => void
	reject: (err: Error, message: string) => void
	error: Error
	message: any
}

export enum Messages {
	ERROR,
	REPLY,
}

export type MessageError<T = unknown> = [
	Messages.ERROR, // type
	string, // constructor
	string, // message
	string, // stack
	T, // extra
]

export type MessageReply<T = unknown> = [
	Messages.REPLY, // type
	T, // args
]

export type WorkerMessage = MessageError | MessageReply

export class WorkerConnection {
	private lastId = 0
	private callbacks: Map<number, CallbackResponse>
	private closed = false

	constructor(private thread: Worker | MessagePort) {
		this.callbacks = new Map()
		thread.on('message', this.onMessage.bind(this))
		thread.once('exit', this.dispose.bind(this))
	}

	public async send(message: any) {
		const id = this.rawSend(message)

		return new Promise((resolve, reject) => {
			this.callbacks.set(id, { resolve, reject, error: new Error(), message })
		})
	}

	public dispose() {
		this.onClose()
	}

	private rawSend(message: any): number {
		const id = ++this.lastId
		this.thread.postMessage([id, message])
		return id
	}

	private onMessage([id, message]: [number, WorkerMessage]) {
		const callback = this.callbacks.get(id)

		if (callback) {
			this.callbacks.delete(id)

			const [type, ...args] = message
			if (type == Messages.ERROR) {
				const [ctor, msg, stack] = args
				const NativeCtor = global[ctor as string]
				const Ctor = typeof NativeCtor === 'function' ? NativeCtor : Error
				const error = new Ctor(msg)
				error.type = name
				error.stack = stack
				callback.reject(error, msg as string)
			} else {
				callback.resolve(args)
			}
		}
	}

	private onClose() {
		if (this.closed) return
		this.closed = true
		this.thread.removeAllListeners()
		for (const callback of this.callbacks.values())
			callback.reject(callback.error, `Protocol error: Worker closed.`)
		this.callbacks.clear()
	}
}
