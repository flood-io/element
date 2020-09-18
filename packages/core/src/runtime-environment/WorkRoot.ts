import { join } from 'path'
import { mkdirpSync } from 'fs-extra'
import { WorkRoot as IWorkRoot, SubRoot, SpecialSubRoot, WorkRootKind } from './types'

const EnvPaths: Record<SubRoot, string | undefined | null> = {
	objects: process.env.FLOOD_OBJECTS_PATH,
	results: process.env.FLOOD_RESULTS_PATH,
	traces: process.env.FLOOD_TRACES_PATH,
	files: process.env.FLOOD_FILES_PATH,
	screenshots: null,
	network: null,
}

export default class WorkRoot implements IWorkRoot {
	// this needs to track SubRoot type
	subRoots: SubRoot[] = ['objects', 'screenshots', 'files', 'results', 'network', 'traces']
	constructor(public root: string, public specialSubRoots: { [key in SpecialSubRoot]: string }) {
		this.ensureExistsSync()
	}

	getRoot(): string {
		return this.root
	}

	getSubRoot(key: string): string {
		return this.specialSubRoots[key]
	}

	ensureExistsSync(): void {
		this.subRoots.forEach(r => mkdirpSync(join(this.root, r)))
	}

	// handles special cases
	rootFor(root: WorkRootKind): string {
		if (this.specialSubRoots[root] != null) {
			return this.specialSubRoots[root as SpecialSubRoot]
		} else {
			if (EnvPaths[root] != null) {
				return EnvPaths[root]
			}
			return join(this.root, root)
		}
	}

	join(root: WorkRootKind, ...segments: string[]): string {
		return join(this.rootFor(root), ...segments)
	}

	testData(filename: string): string {
		return join(this.rootFor('test-data'), filename)
	}
}
