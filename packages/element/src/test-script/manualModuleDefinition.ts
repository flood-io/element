import * as ts from 'typescript'
import { join, resolve, dirname, basename } from 'path'
import { existsSync, readFileSync } from 'fs'

// TODO try to use typescript's resolution support
export function manualModuleDefinition(name: string): ts.ResolvedModule {
	const modulePath = (require.resolve.paths(name) || []).map(p => resolve(p, name)).find(existsSync)

	if (modulePath === undefined) {
		throw new Error(`unable to find ${name}`)
	}

	const resolvedFileName = join(modulePath, 'index.d.ts')

	return {
		resolvedFileName,
		isExternalLibraryImport: true,
	}
}

function readPackage(root: string): any {
	return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
}

export function manualModuleResolution(name: string): ts.ResolvedTypeReferenceDirective {
	const { resolvedFileName } = manualModuleDefinition(name)
	const { version } = readPackage(dirname(resolvedFileName))

	return {
		primary: true,
		resolvedFileName,
		packageId: {
			name,
			subModuleName: basename(resolvedFileName),
			version,
		},
	}
}
