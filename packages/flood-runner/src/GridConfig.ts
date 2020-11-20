import { FloodProcessEnv, WorkRoot } from '@flood/element-api'
import MetricIdentifier from './MetricIdentifier'
import { Logger } from 'winston'
export interface GridConfig {
	metricIdentifier: MetricIdentifier
	sumpHost: string
	sumpPort: number
	threadID: number
	gridSequenceID: number
	gridIndex: number
	nodeSequenceID: number
	nodeIndex: number
	testDuration?: number
	testIterations?: number
	logger: Logger
	workRoot: WorkRoot
	stepEnv(): FloodProcessEnv
}
