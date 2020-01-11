import findRoot from 'find-root'
// import { tmpdir } from 'os'
import { Package } from 'normalize-package-data'
import { existsSync } from 'fs'
import { ResolvedModule, ResolvedTypeReferenceDirective } from 'typescript'
import { manualModuleDefinition, manualModuleResolution } from './manualModuleDefinition'
import path from 'path'
const join = path.join

export class TestScriptHost {
	sandboxedBasenameTypescript: string = 'element-test.ts'
	sandboxedBasenameJavascript: string = 'element-test.js'
	root: string

	private internalModuleResolutions: Map<string, ResolvedModule>
	private internalTypeReferenceResolutions: Map<string, ResolvedTypeReferenceDirective>

	constructor() {
		this.root = findRoot(__dirname)
		this.internalModuleResolutions = new Map()
		this.internalTypeReferenceResolutions = new Map()

		this.internalModuleResolutions.set('@flood/element', this.indexModuleDefinition)
		this.internalModuleResolutions.set('@types/faker', manualModuleDefinition('@types/faker'))
		// this.internalModuleResolutions.set('@types/node', manualModuleDefinition('@types/node'))
		this.internalModuleResolutions.set('assert', manualModuleDefinition('assert'))
		this.internalTypeReferenceResolutions.set('faker', manualModuleResolution('@types/faker'))
		// this.internalTypeReferenceResolutions.set('node', manualModuleResolution('@types/node'))
	}

	get sandboxPath() {
		return 'test-script-sandbox'
	}

	get sandboxRoot() {
		// return join(tmpdir(), 'flood-element-tmp', this.sandboxPath)
		// return join(tmpdir())
		return join(this.root, 'tmp', this.sandboxPath)
	}

	get pkg(): Package {
		return require(join(this.root, 'package.json'))
	}

	get typesPath(): string | undefined {
		return [this.pkg.typings, this.pkg.types, 'index.d.ts']
			.filter(Boolean)
			.map((path: string) => join(this.root, path))
			.find(existsSync)
	}

	get mainPath(): string | undefined {
		return [this.pkg.main, 'index.ts']
			.filter(Boolean)
			.map((path: string) => join(this.root, path))
			.find(existsSync)
		// return [this.pkg.main, 'index.ts'].find(existsSync)
		// return this.pkg.main
	}

	get ambientDeclarationsFile() {
		return join(this.root, 'ambient.d.ts')
	}

	get indexModuleFile() {
		let indexDeclarationsFile = this.typesPath
		let indexTypescriptFile = this.mainPath

		let index = indexTypescriptFile || indexDeclarationsFile
		if (index == null) throw new Error('unable to find index.ts or index.d.ts')

		return index

		// if (existsSync(indexTypescriptFile)) {
		// 	return indexTypescriptFile
		// } else if (existsSync(indexDeclarationsFile)) {
		// 	return indexDeclarationsFile
		// } else {
		// 	throw new Error('unable to find index.ts or index.d.ts')
		// }
	}

	get indexModuleDefinition(): ResolvedModule {
		return {
			resolvedFileName: this.indexModuleFile,
			isExternalLibraryImport: true,
		}
	}

	resolveTypeReferenceDirective(typeRef: string): ResolvedTypeReferenceDirective | null {
		return this.internalTypeReferenceResolutions.get(typeRef) || null
	}

	resolveModuleDefinition(moduleName: string): ResolvedModule | null {
		return this.internalModuleResolutions.get(moduleName) || null
	}
}
