import { IPoint } from 'influx/lib/index'
import { serializePoint } from 'influx/lib/line-protocol'
import { Socket, createSocket } from 'dgram'
import * as zlib from 'zlib'
import { Logger } from 'winston'
import MetricIdentifier from './MetricIdentifier'

import {
	IReporter,
	MeasurementKind,
	TraceData,
	TestEvent,
	CompoundMeasurement,
} from '@flood/element/ReporterAPI'
import { TestScriptError } from '@flood/element/TestScriptAPI'

import { expect } from '@flood/element/expect'

import debugFactory from 'debug'
const debug = debugFactory('element:grid:reporter')

export interface InfluxReporterOptions {
	influxHost: string
	influxPort: number
	metricIdentifier: MetricIdentifier
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

export default class InfluxReporter implements IReporter {
	public responseCode: string = '200'
	public stepName: string

	private socket: Socket
	private measurements: Measurements = {}

	constructor(private options: InfluxReporterOptions, private logger: Logger) {
		this.createSocket()
	}

	private createSocket() {
		this.socket = createSocket('udp4')
	}

	private newPoint(measurement: string, label: string): IPoint {
		return {
			measurement,
			tags: { ...this.options.metricIdentifier.influxTags, label: encodeURIComponent(label) },
			fields: { response_code: this.responseCode },
		}
	}

	private async send(point: IPoint) {
		const payload = serializePoint(point)
		debug(payload)

		// if (measurement === 'trace') {
		// 	console.log(`REPORTER.send() ${JSON.stringify(payload, null, 2)}`)
		// }

		let message = Buffer.from(payload)

		await new Promise((yeah, nah) => {
			this.socket.send(
				message,
				Number(this.options.influxPort),
				this.options.influxHost,
				(err: Error, bytes: number) => {
					if (err) {
						debug(`ERROR: REPORTER.socket.send() ERROR: ${err.message}`)
					} else {
						debug(`REPORTER.socket.send() wrote ${bytes} bytes`)
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
				const point = this.newPoint(measurement, reading.label)

				if (typeof reading.value === 'string' || typeof reading.value === 'number') {
					point.fields['value'] = reading.value
				} else {
					Object.keys(reading.value).forEach(key => (point.fields[key] = reading.value[key]))
				}

				sends.push(this.send(point))
			})
		}

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
