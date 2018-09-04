import { join } from 'path'
import { RuntimeEnvironment, FloodProcessEnv } from '../../src/runtime-environment/types'
import WorkRoot from '../../src/runtime-environment/WorkRoot'

const testDataRoot = join(__dirname, '../fixtures/data')
const packageTmp = join(__dirname, '../../tmp')
const workRoot = join(packageTmp, 'test-work-root')

export function testWorkRoot(root = workRoot, testData = testDataRoot): WorkRoot {
	return new WorkRoot(root, { 'test-data': testData })
}

export default function testRunEnv(
	stepEnv: Partial<FloodProcessEnv> = {},
	root = workRoot,
	testData = testDataRoot,
): RuntimeEnvironment {
	return {
		stepEnv(): FloodProcessEnv {
			return {
				...{
					BROWSER_ID: 1,
					FLOOD_GRID_REGION: 'local',
					FLOOD_GRID_SQEUENCE_ID: 1,
					FLOOD_GRID_SEQUENCE_ID: 1,
					FLOOD_GRID_INDEX: 1,
					FLOOD_GRID_NODE_SEQUENCE_ID: 1,
					FLOOD_NODE_INDEX: 1,
					FLOOD_SEQUENCE_ID: 1,
					FLOOD_PROJECT_ID: 1,
					SEQUENCE: 1,
					FLOOD_LOAD_TEST: false,
				},
				...stepEnv,
			}
		},
		workRoot: testWorkRoot(root, testData),
	}
}
