import Worker from '../Worker'

describe('Worker', () => {
	let worker: Worker

	beforeEach(() => {
		worker = new Worker()
	})

	afterEach(async () => {
		return worker.waitForExit()
	})

	test('it can init a worker', async () => {
		// process.stdout.pipe(worker.stdout)
		// process.stdout.pipe(worker.stderr)

		worker.stderr?.pipe(process.stderr)
		worker.stdout?.pipe(process.stdout)

		await worker.waitForInit()

		// worker.send({ type: ChildMessages.CONNECT }, onStart, onEnd)
		// worker.send({ type: ChildMessages.CONNECT }, onStart, onEnd)
		// worker.send({ type: ChildMessages.CONNECT }, onStart, onEnd)

		expect(worker.workerId).toEqual(1)

		await worker.exit()
	})
})
