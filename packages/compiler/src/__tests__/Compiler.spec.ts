import { Compiler } from '../index'

describe('Compiler', () => {
	it('should compile test script to js string', async () => {
		let compiler = new Compiler('./examples/auto-wait/test.ts')

		let { content } = await compiler.emit()

		return expect(content).toMatchSnapshot()
	}, 30e3)
})
