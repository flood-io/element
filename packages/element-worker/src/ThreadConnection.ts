import { MessagePort } from 'worker_threads'

import { MessageReply, Reply, ReplyOk, ReplyError } from './types'
import { ProtocolInstruction } from './WorkerConnection'

export class ThreadConnection<T, ReplyT> {
	private closed = false

	constructor(private messagePort: MessagePort, private handler: (message: T) => Promise<ReplyT>) {
		messagePort.on('message', this.onMesssage.bind(this))
		messagePort.on('close', this.dispose.bind(this))
	}

	public async emit(eventName: string, data: unknown): Promise<void> {
		// if (this.closed) throw new Error(`Message port is closed`)
		this.messagePort.postMessage([null, [eventName, data]])
	}

	public dispose() {
		this.onClose()
	}

	private async onMesssage(raw: unknown) {
		if (Array.isArray(raw)) {
			const [id, message] = raw as [number, T]
			try {
				const replyMessage = await this.handler(message)
				this.reply(id, [Reply.OK, replyMessage] as ReplyOk)
			} catch (err) {
				this.reply(id, [Reply.ERROR, err.constructor, err.message, err.stack] as ReplyError)
			}
		} else if (typeof raw === 'number') {
			// Protocol layer instruction
			this.handleInstruction(raw)
		}
	}

	private async reply(id: number, message: MessageReply) {
		// if (this.closed) throw new Error(`Message port is closed`)
		this.messagePort.postMessage([id, message])
	}

	private onClose() {
		if (this.closed) return
		this.closed = true
		this.messagePort.removeAllListeners()
	}

	private handleInstruction(instruction: ProtocolInstruction) {
		switch (instruction) {
			case ProtocolInstruction.CLOSE:
				this.dispose()
				break
			default:
				console.warn(`Received unknown protocol instruction: ${instruction}`)
		}
	}
}
