import { MessagePort } from 'worker_threads'

import { Messages, MessageReply } from './WorkerConnection'

export class ThreadConnection<RxT, TxT> {
	private closed = false

	private openReplies: Map<number, RxT> = new Map()

	constructor(private messagePort: MessagePort, private handler: (message: RxT) => Promise<TxT>) {
		messagePort.on('message', this.onMesssage.bind(this))
		messagePort.on('close', this.dispose.bind(this))
	}

	public async reply(id: number, message: MessageReply) {
		if (this.openReplies.has(id)) {
			this.messagePort.postMessage([id, message])
			this.openReplies.delete(id)
		}
	}

	public dispose() {
		this.onClose()
	}

	private async onMesssage([id, message]: [number, RxT]) {
		this.openReplies.set(id, message)
		const replyMessage = await this.handler(message)
		this.reply(id, [Messages.REPLY, replyMessage])
	}

	private onClose() {
		if (this.closed) return
		this.closed = true
		this.messagePort.removeAllListeners()
	}
}
