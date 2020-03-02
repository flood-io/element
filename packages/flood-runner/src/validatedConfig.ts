import { assertConfig, assertConfigString } from './ConfigUtils'
import { GridConfig } from './GridConfig'

export function validatedConfig(gridConfig: Partial<GridConfig>): GridConfig | never {
	assertConfigString(gridConfig.sumpHost, 'FLOOD_SUMP_HOST not set')
	assertConfig(gridConfig.sumpPort, 'FLOOD_SUMP_PORT not set')
	if (gridConfig.metricIdentifier === undefined) {
		throw new Error('metricIdentifier not configured')
	}
	if (!gridConfig.metricIdentifier.isValid) {
		throw new Error(`metricIdentifier invalid: ${gridConfig.metricIdentifier.invalidReason}`)
	}
	// TODO exhaustive validation
	return gridConfig as GridConfig
}
