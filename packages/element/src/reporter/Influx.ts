import { Socket, createSocket } from 'dgram'
import debug from 'debug'
const debugReporter = debug('flood:reporter')
import * as zlib from 'zlib'
import { IReporter, MeasurementKind, TraceData, TestEvent, CompoundMeasurement } from '../Reporter'
import Logger from '../utils/Logger'
import { TestScriptError } from './../TestScript'
import { expect } from '../runtime/VM'

interface ReporterOptions {
	/**
	 * Name to report to Flood Sump
	 * @type {string}
	 */
	name: string
	host: string
	port: string
	flood: string
	account: string
	project: string
	region: string
	grid: string
	node: string
}

type MeasurementData = {
	value: string | number | CompoundMeasurement
	label: string
}

type Measurements = { [key in MeasurementKind]?: MeasurementData[] }

export function encodeTraceData(traceData) {
	let compressedData = zlib.gzipSync(new Buffer(JSON.stringify(traceData), 'utf8'))
	return compressedData.toString('base64')
}
export function decodeTraceData(traceData) {
	return JSON.parse(zlib.unzipSync(new Buffer(traceData, 'base64')).toString('utf8'))
}

export default class Influx implements IReporter {
	public responseCode: string = '200'
	public stepName: string

	private socket: Socket
	private options: ReporterOptions
	private measurements: Measurements = {}

	constructor(private logger: Logger) {
		this.loadEnv()
		this.createSocket()
	}

	private createSocket() {
		this.socket = createSocket('udp4')
	}

	private loadEnv() {
		let env = process.env
		this.options = {
			name: env.FLOOD_SUMP_NAME || 'results',
			host: env.FLOOD_SUMP_HOST || 'localhost',
			port: env.FLOOD_SUMP_PORT || '35663',
			flood: env.FLOOD_SEQUENCE_ID || '1',
			account: env.FLOOD_ACCOUNT_ID || '1',
			project: env.FLOOD_PROJECT_ID || '1',
			region: env.FLOOD_GRID_REGION || 'local',
			grid: env.FLOOD_GRID_SQEUENCE_ID || '1',
			node: env.FLOOD_GRID_NODE_SEQUENCE_ID || '1',
		} as ReporterOptions
	}

	private async send(measurement, tags = [], values) {
		let payload = `${measurement},${tags.join(',')} ${values.join(',')}`
		debugReporter(payload)

		// if (measurement === 'trace') {
		// 	console.log(`REPORTER.send() ${JSON.stringify(payload, null, 2)}`)
		// }

		let message = Buffer.from(payload)

		await new Promise((yeah, nah) => {
			this.socket.send(
				message,
				Number(this.options.port),
				this.options.host,
				(err: Error, bytes: number) => {
					if (err) {
						debugReporter(`ERROR: REPORTER.socket.send() ERROR: ${err.message}`)
					} else {
						debugReporter(`REPORTER.socket.send() wrote ${bytes} bytes`)
					}
					yeah()
				},
			)
		})
	}

	close() {
		return this.socket.close()
	}

	reset(stepName?: string): void {
		this.stepName = stepName
		this.responseCode = '200'
		this.measurements = {}
	}

	addTrace(traceData: TraceData, label: string): void {
		if (!traceData.objects) traceData.objects = []
		let base64EncodedData = encodeTraceData(traceData)
		this.addMeasurement('object', base64EncodedData, label)
	}

	addMeasurement(measurement: MeasurementKind, value: string | number, label?: string): void {
		if (typeof value === 'string') {
			value = `"${value}"`
		}

		label = expect(
			label || this.stepName,
			`Label must be present when writing measurement: ${measurement}`,
		)

		if (!this.measurements[measurement]) this.measurements[measurement] = []
		this.measurements[measurement].push({ value, label })
	}

	addCompoundMeasurement(
		measurement: MeasurementKind,
		value: CompoundMeasurement,
		label: string,
	): void {
		label = expect(
			label || this.stepName,
			`Label must be present when writing compound measurement: ${measurement}`,
		)

		if (!this.measurements[measurement]) this.measurements[measurement] = []
		this.measurements[measurement].push({ value, label })
	}

	async flushMeasurements(): Promise<void> {
		let sends = []
		let printedResults = []

		for (const [measurement, values] of Object.entries(this.measurements)) {
			if (!['trace', 'object'].includes(measurement)) {
				printedResults.push(
					`${measurement}: [${this.measurements[measurement]
						.map(m => JSON.stringify(m.value))
						.join(', ')}]`,
				)
			}

			values.forEach((reading, index) => {
				let values = []
				if (typeof reading.value === 'string' || typeof reading.value === 'number') {
					values = [`value=${String(reading.value)}`]
				} else {
					values = Object.keys(reading.value).map(key => `${key}=${String(reading.value[key])}`)
				}

				sends.push(
					this.send(
						measurement,
						[
							`account=${this.options.account}`,
							`flood=${this.options.flood}`,
							`region=${this.options.region}`,
							`grid=${this.options.grid}`,
							`node=${this.options.node}`,
							`project=${this.options.project}`,
							`label=${encodeURIComponent(reading.label)}`,
						],
						[...values, `response_code=${JSON.stringify(String(this.responseCode))}`],
					),
				)
			})
		}

		// const sends = Object.keys(this.measurements)
		// 	.map(kind => [kind, this.measurements[kind]])
		// 	.map(([kind, measurement]) =>
		// 		this.send(
		// 			kind,
		// 			[
		// 				`account=${this.options.account}`,
		// 				`flood=${this.options.flood}`,
		// 				`region=${this.options.region}`,
		// 				`grid=${this.options.grid}`,
		// 				`node=${this.options.node}`,
		// 				`project=${this.options.project}`,
		// 				`label=${encodeURIComponent(measurement.label)}`,
		// 			],
		// 			[
		// 				`value=${String(measurement.value)}`,
		// 				`response_code=${JSON.stringify(String(this.responseCode))}`,
		// 			],
		// 		),
		// 	)

		this.logger.debug(`> ${printedResults.join(`, `)}`)

		await Promise.all(sends)

		this.reset()
	}

	testLifecycle(stage: TestEvent, label: string): void {
		// this.logger.debug(`lifecycle: stage: ${stage} label: ${label}`)
		switch (stage) {
			case TestEvent.AfterStepAction:
				this.logger.info(`---> ${label}()`)
				break
			case TestEvent.BeforeStep:
				this.logger.info(`===> Step '${label}'`)
				break
			case TestEvent.AfterStep:
				this.logger.info(`---> Step '${label}' finished`)
				break
			case TestEvent.StepSkipped:
				this.logger.info(`---- Step '${label}'`)
				break
		}
	}

	testScriptError(message: string, error: TestScriptError): void {
		this.logger.error(`=!=> ${message} in ${this.stepName}: ${error.name}: ${error.message}`)
		error.unmappedStack.forEach(line => this.logger.error(`    ${line}`))
	}

	testStepError(error: TestScriptError): void {
		this.testScriptError('Failure', error)
	}

	testInternalError(message: string, error: Error): void {
		this.logger.error(`=!=> Internal ${message} error in ${this.stepName}`, error.message)
	}

	testAssertionError(error: TestScriptError): void {
		this.testScriptError('Assertion failure', error)
	}

	testScriptConsole(method: string, message?: any, ...optionalParams: any[]): void {
		console[method](message, ...optionalParams)
	}
}
