import { ProcessEnv } from './types'

export function devDefaults(env: ProcessEnv): void {
	// dev only
	env.THREAD_ID = env.THREAD_ID || '1'
	env.FLOOD_SEQUENCE_ID = env.FLOOD_SEQUENCE_ID || '1'
	env.FLOOD_ACCOUNT_ID = env.FLOOD_ACCOUNT_ID || '1'
	env.FLOOD_PROJECT_ID = env.FLOOD_PROJECT_ID || '1'
	env.FLOOD_GRID_REGION = env.FLOOD_GRID_REGION || 'devland'
	env.FLOOD_GRID_SEQUENCE_ID = env.FLOOD_GRID_SEQUENCE_ID || '1'
	env.FLOOD_GRID_SQEUENCE_ID = env.FLOOD_GRID_SQEUENCE_ID || '1'
	env.FLOOD_GRID_NODE_SEQUENCE_ID = env.FLOOD_GRID_NODE_SEQUENCE_ID || '1'
	env.FLOOD_SUMP_HOST = env.FLOOD_SUMP_HOST || 'localhost'
	env.FLOOD_SUMP_PORT = env.FLOOD_SUMP_PORT || '35663'
	// env.FLOOD_TEST_ITERATIONS = env.FLOOD_TEST_ITERATIONS || '-1'
	// env.FLOOD_TEST_DURATION = env.FLOOD_TEST_DURATION || '-1'
}
