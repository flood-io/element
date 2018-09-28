import { WorkRootKind } from './types'
import * as path from 'path'

const nullFloodProcessEnv = {
	BROWSER_ID: 0,
	FLOOD_GRID_REGION: 'null',
	FLOOD_GRID_SQEUENCE_ID: 0,
	FLOOD_GRID_SEQUENCE_ID: 0,
	FLOOD_GRID_INDEX: 0,
	FLOOD_GRID_NODE_SEQUENCE_ID: 0,
	FLOOD_NODE_INDEX: 0,
	FLOOD_SEQUENCE_ID: 0,
	FLOOD_PROJECT_ID: 0,
	SEQUENCE: 0,
	FLOOD_LOAD_TEST: false,
}

export class NullWorkRoot {
	ensureCreated(): void {}

	join(kind: WorkRootKind, ...segments: string[]): string {
		return path.join('/tmp', kind, ...segments)
	}

	testData(filename: string): string {
		return path.join('/tmp/test-data', filename)
	}
}

export const nullRuntimeEnvironment = {
	workRoot: new NullWorkRoot(),
	stepEnv() {
		return nullFloodProcessEnv
	},
}
