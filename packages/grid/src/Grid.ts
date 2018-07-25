import { runCommandLine, ElementOptions } from '@flood/element'
import { WorkRoot } from '@flood/element/RuntimeEnvironmentAPI'
import MetricIdentifier from './MetricIdentifier'
import InfluxReporter from './InfluxReporter'
import { initFromEnvironment } from './Environment'
import { Logger } from 'winston'
import createLogger from './Logger'
import { FloodProcessEnv } from '@flood/chrome'

export interface GridConfig {
	metricIdentifier: MetricIdentifier
	sumpHost: string
	sumpPort: number

	threadID: number
	gridSequenceID: number
	gridIndex: number
	nodeSequenceID: number
	nodeIndex: number

	testDuration: number
	testIterations: number

	logger: Logger

	workRoot: WorkRoot
	stepEnv(): FloodProcessEnv
}

export async function main(argv: string[]): Promise<void> {
	const file = argv[2]
	const gridConfig = initConfig()

	const influxReporter = initInfluxReporter(gridConfig)

	const opts: ElementOptions = {
		logger: gridConfig.logger,
		testScript: file,
		reporter: influxReporter,
		runEnv: gridConfig,
		// TODO console reporter
	}

	await runCommandLine(opts)
	return
}

function initConfig(): GridConfig {
	const gridConfig: Partial<GridConfig> = initFromEnvironment()
	gridConfig.logger = createLogger(gridConfig.threadID)

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
