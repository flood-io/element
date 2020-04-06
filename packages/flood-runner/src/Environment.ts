import { newMetricIdentifierFromObject } from './MetricIdentifier'
import { GridConfig } from './GridConfig'
import { WorkRoot, FloodProcessEnv } from '@flood/element-api'
import findRoot from 'find-root'
import { join } from 'path'
import { ensureDirSync } from 'fs-extra'
import { devDefaults } from './defaults'
import { ProcessEnv } from './types'

const defaultInfluxPort = 35663

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
		SEQUENCE: this.threadID * this.gridSequenceID * (this.nodeIndex + 1),
		FLOOD_LOAD_TEST: true,
	}
}

const num = (v?: string, defaultValue?: number): number | undefined => {
	if (v === undefined || v.trim() === '') {
		return defaultValue
	}

	const n = Number(v)
	if (Number.isNaN(n)) {
		return defaultValue
	}

	return n
}

export function initFromEnvironment(env: ProcessEnv = process.env): Partial<GridConfig> {
	let root: string
	let testDataRoot: string

	if (env.NODE_ENV !== 'production') {
		devDefaults(env)
		const projectRoot = findRoot(__dirname)
		root = join(projectRoot, 'tmp/data')
		testDataRoot = join(projectRoot, 'tmp/data/flood/files')
	} else {
		// Supplied by Grid
		root = env.FLOOD_DATA_ROOT || '/data/flood'
		testDataRoot = env.FLOOD_FILES_PATH || join(root, 'files')
	}

	ensureDirSync(join(root, 'lock'))

	const workRoot = new WorkRoot(root, {
		'test-data': testDataRoot,
	})

	const metricIdentifier = newMetricIdentifierFromObject({
		floodID: Number(env.FLOOD_SEQUENCE_ID),
		accountID: Number(env.FLOOD_ACCOUNT_ID),
		projectID: Number(env.FLOOD_PROJECT_ID),
		gridID: Number(env.FLOOD_GRID_SEQUENCE_ID || env.FLOOD_GRID_SQEUENCE_ID),
		nodeID: Number(env.FLOOD_GRID_NODE_SEQUENCE_ID),
		region: env.FLOOD_GRID_REGION,
	})

	return {
		metricIdentifier,
		sumpHost: env.FLOOD_SUMP_HOST,
		sumpPort: num(env.FLOOD_SUMP_PORT, defaultInfluxPort),

		threadID: num(env.THREAD_ID, -1),
		gridSequenceID: num(env.FLOOD_GRID_SQEUENCE_ID, -1),
		gridIndex: num(env.FLOOD_GRID_INDEX, -1),
		nodeSequenceID: num(env.FLOOD_GRID_NODE_SEQUENCE_ID, -1),
		nodeIndex: num(env.FLOOD_NODE_INDEX, -1),

		testIterations: num(env.FLOOD_TEST_ITERATIONS, undefined),
		testDuration: num(env.FLOOD_TEST_DURATION, undefined),
		workRoot,
		stepEnv,
	}
}
