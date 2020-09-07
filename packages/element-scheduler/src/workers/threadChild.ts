import { parentPort, workerData } from 'worker_threads'
import {
	ChildMessages,
	ChildMessage,
	ChildMessageCall,
	ParentMessages,
	MessageConst,
	ActionConst,
} from '../types'

import {
	AsyncFactory,
	EvaluatedScript,
	PlaywrightClient,
	connectWS,
	Runner,
	RuntimeEnvironment,
	WorkRoot,
	mustCompileFile,
	TestSettings,
} from '@flood/element-core'
import { ConsoleReporter } from './ConsoleReporter'
import createLogger from './Logger'

function environment(root: string, testData: string): RuntimeEnvironment {
	const workRoot = new WorkRoot(root, {
		'test-data': testData,
	})

	return {
		workRoot,
		stepEnv() {
			return {
				BROWSER_ID: this.workerId,
				FLOOD_GRID_REGION: 'local',
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
		},
	}
}

async function execMethod(method: string, args: Array<any>) {
	switch (method) {
		case ActionConst.RUN: {
			const [testScript, stageIterator] = args
			const { wsEndpoint, workerName, rootEnv, testData, settings } = workerData.env

			const verboseBool = true
			const logLevel = 'debug'
			const logger = createLogger(logLevel, true)
			const reporter = new ConsoleReporter(logger, verboseBool, workerName)
			const childSettings: TestSettings = JSON.parse(settings)

			const env = environment(rootEnv, testData)
			const testScriptFactory = async (): Promise<EvaluatedScript> => {
				return new EvaluatedScript(env, await mustCompileFile(testScript))
			}

			const clientFactory = (): AsyncFactory<PlaywrightClient> => {
				return () => connectWS(wsEndpoint, childSettings.browserType)
			}

			const runner = new Runner(clientFactory(), undefined, reporter, {}, childSettings)

			await runner.run(testScriptFactory)
			await runner.stop()

			if (parentPort) {
				parentPort.postMessage([ParentMessages.OK, MessageConst.RUN_COMPLETED, [stageIterator]])
			}
		}
	}
}

const messageListener = async (request: ChildMessage) => {
	const [type] = request

	switch (type) {
		case ChildMessages.INITIALIZE: {
			if (parentPort) {
				parentPort.postMessage([ParentMessages.OK, MessageConst.LOADED, []])
			}
			break
		}

		case ChildMessages.CALL: {
			const call = request as ChildMessageCall
			await execMethod(call[1], call[2]).catch(err => {
				if (parentPort) {
					parentPort.postMessage([
						ParentMessages.CLIENT_ERROR,
						'Worker Error',
						err.message,
						'',
						call[2][1],
					])
				}
			})
			break
		}

		case ChildMessages.END: {
			if (parentPort) parentPort.removeListener('message', messageListener)
			break
		}

		default:
			throw new TypeError('Unexpected request from parent process: ' + request[0])
	}
}

if (parentPort) parentPort.on('message', messageListener)
