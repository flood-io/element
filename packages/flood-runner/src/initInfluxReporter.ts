import InfluxReporter from './InfluxReporter'
import { GridConfig } from './GridConfig'

export function initInfluxReporter(gridConfig: GridConfig): InfluxReporter {
	return new InfluxReporter(
		{
			influxHost: gridConfig.sumpHost,
			influxPort: gridConfig.sumpPort,
			metricIdentifier: gridConfig.metricIdentifier,
		},
		gridConfig.logger,
	).validateConfig()
}
