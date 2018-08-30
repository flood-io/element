export interface FloodProcessEnv {
	BROWSER_ID: number
	FLOOD_GRID_REGION: string
	FLOOD_GRID_SQEUENCE_ID: number
	FLOOD_GRID_SEQUENCE_ID: number
	FLOOD_GRID_INDEX: number
	FLOOD_GRID_NODE_SEQUENCE_ID: number
	FLOOD_NODE_INDEX: number
	FLOOD_SEQUENCE_ID: number
	FLOOD_PROJECT_ID: number

	/**
	 * Globally unique sequence number for this browser instance.
	 */
	SEQUENCE: number

	IN_GRID: boolean
}

export const nullFloodProcessEnv: FloodProcessEnv = {
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
	IN_GRID: false,
}

export interface RuntimeEnvironment {
	stepEnv(): FloodProcessEnv
	workRoot: WorkRoot
}

export type SpecialSubRoot = 'test-data'
export type SubRoot = 'objects' | 'screenshots' | 'files' | 'results' | 'network' | 'traces'
export type WorkRootKind = SubRoot | SpecialSubRoot
export interface WorkRoot {
	ensureCreated(): void

	join(kind: WorkRootKind, ...segments: string[]): string
}
