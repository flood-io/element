import { WorkRootKind, nullFloodProcessEnv } from './types'
import * as path from 'path'

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
