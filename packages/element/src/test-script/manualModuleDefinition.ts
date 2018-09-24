import * as ts from 'typescript'
import { join, resolve } from 'path'
import { existsSync } from 'fs'

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
