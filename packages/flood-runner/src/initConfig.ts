import { initFromEnvironment } from './Environment'
import { GridConfig } from './GridConfig'
import { validatedConfig } from './validatedConfig'

export function initConfig(): GridConfig | never {
	const gridConfig: Partial<GridConfig> = initFromEnvironment()
	if (gridConfig.threadID === undefined) {
		throw new Error('unable to configure grid: threadID not set')
	}
	return validatedConfig(gridConfig)
}
