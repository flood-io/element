import { newMetricIdentifierFromObject } from './MetricIdentifier'
import { GridConfig } from './Grid'
import WorkRoot from './WorkRoot'
import * as findRoot from 'find-root'
import * as path from 'path'

interface ProcessEnv {
	[key: string]: string | undefined
}

export function initFromEnvironment(env: ProcessEnv = process.env): Partial<GridConfig> {
	let root: string
	if (env.NODE_ENV !== 'production') {
		devDefaults(env)
		root = path.join(findRoot(__dirname), 'dev-data')
	} else {
		root = '/data'
	}

	const workRoot = new WorkRoot(root)

	const metricIdentifier = newMetricIdentifierFromObject({
		floodID: Number(env.FLOOD_SEQUENCE_ID),
		accountID: Number(env.FLOOD_ACCOUNT_ID),
		projectID: Number(env.FLOOD_PROJECT_ID),
		gridID: Number(env.FLOOD_GRID_SEQUENCE_ID),
		nodeID: Number(env.FLOOD_GRID_NODE_SEQUENCE_ID),
		region: env.FLOOD_GRID_REGION,
	})

	const num = (v: string | undefined): number => {
		if (v === undefined || v.trim() == '') {
			return -1
		}

		const n = Number(v)
		if (Number.isNaN(n)) {
			return -1
		}

		return n
	}

	return {
		metricIdentifier,
		sumpHost: env.FLOOD_SUMP_HOST,
		sumpPort: Number(env.FLOOD_SUMP_PORT),
		workRoot,
		threadID: num(env.THREAD_ID),
		testIterations: num(env.FLOOD_TEST_ITERATIONS),
		testDuration: num(env.FLOOD_TEST_DURATION),
	}
}

function devDefaults(env: ProcessEnv): void {
	// dev only
	env.FLOOD_SEQUENCE_ID = env.FLOOD_SEQUENCE_ID || '1'
	env.FLOOD_ACCOUNT_ID = env.FLOOD_ACCOUNT_ID || '1'
	env.FLOOD_PROJECT_ID = env.FLOOD_PROJECT_ID || '1'
	env.FLOOD_GRID_REGION = env.FLOOD_GRID_REGION || 'devland'
	env.FLOOD_GRID_SEQUENCE_ID = env.FLOOD_GRID_SEQUENCE_ID || '1'
	env.FLOOD_GRID_NODE_SEQUENCE_ID = env.FLOOD_GRID_NODE_SEQUENCE_ID || '1'

	env.FLOOD_SUMP_HOST = env.FLOOD_SUMP_HOST || 'localhost'
	env.FLOOD_SUMP_PORT = env.FLOOD_SUMP_PORT || '35663'

	env.FLOOD_TEST_ITERATIONS = env.FLOOD_TEST_ITERATIONS || '-1'
	env.FLOOD_TEST_DURATION = env.FLOOD_TEST_DURATION || '-1'
}
