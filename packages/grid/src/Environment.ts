import { newMetricIdentifierFromObject } from './MetricIdentifier'
import { GridConfig } from './Grid'
import { WorkRoot } from '@flood/element/RuntimeEnvironmentAPI'
import * as findRoot from 'find-root'
import * as path from 'path'
import { FloodProcessEnv } from '@flood/chrome'

interface ProcessEnv {
	[key: string]: string | undefined
}

function stepEnv(): FloodProcessEnv {
	return {
		BROWSER_ID: this.threadID,
		FLOOD_GRID_REGION: this.region,
		FLOOD_GRID_SQEUENCE_ID: this.gridSequenceID,
		FLOOD_GRID_SEQUENCE_ID: this.gridSequenceID,
		FLOOD_GRID_INDEX: this.gridIndex,
		FLOOD_GRID_NODE_SEQUENCE_ID: this.nodeSequenceID,
		FLOOD_NODE_INDEX: this.nodeIndex,
		FLOOD_SEQUENCE_ID: this.metricIdentifier.floodID,
		FLOOD_PROJECT_ID: this.metricIdentifier.projectID,
		SEQUENCE: this.threadID * this.gridSequenceID * this.nodeIndex,
	}
}

export function initFromEnvironment(env: ProcessEnv = process.env): Partial<GridConfig> {
	let root: string
	let testDataRoot: string

	if (env.NODE_ENV !== 'production') {
		devDefaults(env)
		const projectRoot = findRoot(__dirname)
		root = path.join(projectRoot, 'tmp/data/flood')
		testDataRoot = path.join(projectRoot, 'tmp/data/flood')
	} else {
		root = '/data'
		testDataRoot = env.TEST_DATA_DIRECTORY || '/data/flood'
	}

	const workRoot = new WorkRoot(root, {
		'test-data': testDataRoot,
	})

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

		threadID: num(env.THREAD_ID),
		gridSequenceID: num(env.FLOOD_GRID_SQEUENCE_ID),
		gridIndex: num(env.FLOOD_GRID_INDEX),
		nodeSequenceID: num(env.FLOOD_GRID_NODE_SEQUENCE_ID),
		nodeIndex: num(env.FLOOD_NODE_INDEX),

		testIterations: num(env.FLOOD_TEST_ITERATIONS),
		testDuration: num(env.FLOOD_TEST_DURATION),
		workRoot,
		stepEnv,
	}
}

function devDefaults(env: ProcessEnv): void {
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

	env.FLOOD_TEST_ITERATIONS = env.FLOOD_TEST_ITERATIONS || '-1'
	env.FLOOD_TEST_DURATION = env.FLOOD_TEST_DURATION || '-1'
}
