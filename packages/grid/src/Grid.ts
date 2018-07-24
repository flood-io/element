import { runCommandLine, ElementOptions } from '@flood/element'
import MetricIdentifier from './MetricIdentifier'
import WorkRoot from './WorkRoot'
import InfluxReporter from './InfluxReporter'
import { initFromEnvironment } from './Environment'
import { createLogger, Logger } from 'winston'

export interface GridConfig {
	metricIdentifier: MetricIdentifier
	sumpHost: string
	sumpPort: number
	workRoot: WorkRoot

	threadID: number

	testDuration: number
	testIterations: number

	logger: Logger
}

export async function main(argv: string[]): Promise<void> {
	const file = argv[2]
	const gridConfig = initConfig()

	const influxReporter = initInfluxReporter(gridConfig)

	const opts: ElementOptions = {
		logger: createLogger(),
		testScript: file,
		reporter: influxReporter,
		// TODO console reporter
	}

	await runCommandLine(opts)
	return
}

function initConfig(): GridConfig {
	const gridConfig: Partial<GridConfig> = initFromEnvironment()
	gridConfig.logger = createLogger()

	const completeGridConfig: GridConfig = gridConfig as GridConfig

	return completeGridConfig
}

function initInfluxReporter(gridConfig: GridConfig): InfluxReporter {
	return new InfluxReporter(
		{
			influxHost: gridConfig.sumpHost,
			influxPort: gridConfig.sumpPort,
			metricIdentifier: gridConfig.metricIdentifier,
		},
		gridConfig.logger,
	)
}
