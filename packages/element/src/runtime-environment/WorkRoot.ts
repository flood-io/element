import * as path from 'path'
import { sync as mkdirpSync } from 'mkdirp'
import { WorkRoot as IWorkRoot, SubRoot, SpecialSubRoot, WorkRootKind } from '../types'

export default class WorkRoot implements IWorkRoot {
	root: string
	// this needs to track SubRoot type
	subRoots: SubRoot[] = ['objects', 'screenshots', 'files', 'results', 'network', 'traces']
	constructor(
		public dataRoot: string,
		public specialSubRoots: { [key in SpecialSubRoot]: string },
	) {
		this.root = path.join(this.dataRoot, 'flood')
		this.ensureCreated()
	}

	ensureCreated(): void {
		this.subRoots.forEach(r => mkdirpSync(path.join(this.root, r)))
	}

	// handles special cases
	rootFor(root: WorkRootKind): string {
		if (this.specialSubRoots.hasOwnProperty(root)) {
			return this.specialSubRoots[root]
		} else {
			return path.join(this.root, root)
		}
	}

	join(root: WorkRootKind, ...segments: string[]): string {
		return path.join(this.rootFor(root), ...segments)
	}
}

// TODO extract
// const ENV_TEST_DATA_DIRECTORY = process.env.TEST_DATA_DIRECTORY

// // If we're on a Grid Node
// export const testDataDirectory = ENV_TEST_DATA_DIRECTORY
// ? ENV_TEST_DATA_DIRECTORY
// : process.env.FLOOD_SEQUENCE_ID ? '/data/flood' : 'tmp/data/flood'

// export const networkDataDirectory = process.env.FLOOD_SEQUENCE_ID
// ? '/data/flood/network'
// : 'tmp/data/flood/network'
// export const tracesDirectory = process.env.FLOOD_SEQUENCE_ID
// ? '/data/flood/screenshots'
// : 'tmp/data/flood/screenshots'
