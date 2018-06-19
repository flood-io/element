import Logger from './utils/Logger'
import Runner from './Runner'
import { ITestRunner, Browser } from './types'
import { compileFile } from './TestScript'

export default class Loader {
	logger: Logger
	testScript: string
	runner: ITestRunner
	driverClass: any

	constructor(testScript: string, driverClass: { new (): Browser }) {
		this.logger = new Logger()
		this.testScript = testScript
		this.driverClass = driverClass
	}

	async run(): Promise<void> {
		if (this.testScript) {
			this.logger.debug(`Loading test script: ${this.testScript}`)

			const testScript = await compileFile(this.testScript)

			if (testScript.hasErrors) {
				this.logger.error(`errors compiling script:\n${testScript.formattedErrorString}`)
				return
			}

			// TODO handle warnings?

			this.runner = new Runner(this.driverClass, this.logger)
			await this.runner.run(testScript)
			return
		} else {
			throw new Error('No test script supplied as first argument')
		}
	}
}
