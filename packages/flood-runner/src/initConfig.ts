import { initFromEnvironment } from './Environment'
import { GridConfig } from './GridConfig'
import { validatedConfig } from './validatedConfig'

export function initConfig(testScript = ''): GridConfig | never {
	const gridConfig: Partial<GridConfig> = initFromEnvironment(process.env, testScript)
	if (gridConfig.threadID === undefined) {
		throw new Error('unable to configure grid: threadID not set')
	}
	return validatedConfig(gridConfig)
}
