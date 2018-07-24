import * as path from 'path'
import { sync as mkdirpSync } from 'mkdirp'

type Root = 'objects' | 'screenshots' | 'files' | 'results'
const roots: Root[] = ['objects', 'screenshots', 'files', 'results']

export default class WorkRoot {
	root: string
	constructor(public dataRoot: string) {
		this.root = path.join(this.dataRoot, 'flood')
		this.ensureRoots()
	}

	ensureRoots(): void {
		roots.forEach(r => mkdirpSync(path.join(this.root, r)))
	}

	join(root: Root, ...segments: string[]): string {
		return path.join(this.root, root, ...segments)
	}
}
