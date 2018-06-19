import * as cuid from 'cuid'
import { promisify } from 'util'
import { writeFile } from 'fs'
import { join } from 'path'
import { networkDataDirectory } from '../runtime/Sandbox'
import { Assertion } from '../runtime/Test'
import { NetworkTraceData } from '../Reporter'
import { ensureDir } from 'fs-extra'

const writeFileAsync = promisify(writeFile)

interface ErrorLike {
	message: string
	stack?: string | string[]
}

export class ObjectTrace {
	constructor(
		public label: string,
		public errors: ErrorLike[] = [],
		public assertions: Assertion[] = [],
		public screenshots: string[] = [],
		public networkTraces: string[] = [],
	) {}

	public addError(error: ErrorLike) {
		let { message, stack } = error
		this.errors.push({
			message,
			stack,
		})
	}

	public async addNetworkTrace(trace: NetworkTraceData): Promise<void> {
		await ensureDir(networkDataDirectory).catch(err => {
			console.error(err)
		})

		let fileName = `${cuid()}.json`
		let filePath = join(networkDataDirectory, fileName)
		this.networkTraces.push(filePath)

		return writeFileAsync(filePath, JSON.stringify(trace))
			.catch(err => {
				console.error(`Object Trace writing ERROR: ${err.message}`)
			})
	}

	public addScreenshot(screenshotURL: string) {
		this.screenshots.push(screenshotURL)
	}

	public addAssertion(assertion: Assertion) {
		this.assertions.push(assertion)
	}

	get isEmpty(): boolean {
		let { screenshots, networkTraces, assertions, errors } = this
		return (
			screenshots.length === 0 &&
			networkTraces.length === 0 &&
			assertions.length === 0 &&
			errors.length === 0
		)
	}

	public toObject() {
		let { label, screenshots, networkTraces, assertions, errors } = this

		let objectTypes: string[] = []
		let objects = []
		screenshots.forEach(screenshot => {
			objects.push(screenshot)
			objectTypes.push('screenshot')
		})

		networkTraces.forEach(trace => {
			objects.push(trace)
			objectTypes.push('trace')
		})

		return {
			op: 'object',
			label,
			objects,
			errors,
			assertions,
			objectTypes,
		}
	}
}
