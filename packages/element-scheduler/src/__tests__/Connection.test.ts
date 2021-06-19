import { ThreadConnection } from '../ThreadConnection'
import { WorkerConnection } from '../WorkerConnection'
import { MessagePort } from 'worker_threads'
import { EventEmitter } from 'events'

class FakeMessagePort extends EventEmitter implements Partial<MessagePort> {
	close(): void {
		this.emit('close')
		return
	}
	postMessage(value: any): void {
		this.emit('message', value)
	}

	ref(): void {
		return
	}
	unref(): void {
		return
	}
	start(): void {
		return
	}
}

describe('Connection', () => {
	test('it can send a message over a port', async () => {
		const port1 = new FakeMessagePort()

		new ThreadConnection<string, string>(port1, async (message) => message)

		const wc = new WorkerConnection(port1)
		const response = await wc.send('Hello World')
		expect(response).toEqual(['Hello World'])
	})
})
