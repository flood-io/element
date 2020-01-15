import KSUID from 'ksuid'
import { promisify } from 'util'
import { writeFile } from 'fs'
import { WorkRoot } from '../runtime-environment/types'
import { Assertion } from '../runtime/Assertion'
import { NetworkTraceData, CompositeTraceData } from '../Reporter'

const writeFileAsync = promisify(writeFile)

interface ErrorLike {
	message: string
	stack?: string | string[]
}

export interface IObjectTrace {
	addError(error: ErrorLike): void
	addNetworkTrace(trace: NetworkTraceData): Promise<void>
	addScreenshot(screenshotURL: string): void
	addAssertion(assertion: Assertion): void
	isEmpty: boolean
	toObject(): CompositeTraceData
}

export const NullObjectTrace = {
	isEmpty: true,

	addError(error: ErrorLike) {},
	async addNetworkTrace(trace: NetworkTraceData): Promise<void> {},
	addScreenshot(screenshotURL: string) {},
	addAssertion(assertion: Assertion) {},

	toObject(): CompositeTraceData {
		return {
			op: 'object',
			label: '',
			objects: [],
			errors: [],
			assertions: [],
			objectTypes: [],
		}
	},
}

export class ObjectTrace {
	constructor(
		private workRoot: WorkRoot,
		public label: string,
		public errors: ErrorLike[] = [],
		public assertions: Assertion[] = [],
		public screenshots: string[] = [],
		public networkTraces: string[] = [],
	) {}

	public addError(error: ErrorLike) {
		const { message, stack } = error
		this.errors.push({
			message,
			stack,
		})
	}

	public async addNetworkTrace(trace: NetworkTraceData): Promise<void> {
		const fileId = KSUID.randomSync().toString()

		const filePath = this.workRoot.join('network', `${fileId}.json`)
		this.networkTraces.push(filePath)

		return writeFileAsync(filePath, JSON.stringify(trace)).catch(err => {
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
		const { screenshots, networkTraces, assertions, errors } = this
		return (
			screenshots.length === 0 &&
			networkTraces.length === 0 &&
			assertions.length === 0 &&
			errors.length === 0
		)
	}

	public toObject(): CompositeTraceData {
		const { label, screenshots, networkTraces, assertions, errors } = this

		const objectTypes: string[] = []
		const objects: string[] = []
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
