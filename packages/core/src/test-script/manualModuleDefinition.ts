import ts, {
	CompilerOptions,
	ModuleResolutionKind,
	createCompilerHost,
	nodeModuleNameResolver,
} from 'typescript'
import { join, dirname, basename } from 'path'
import { readFileSync } from 'fs'

// TODO try to use typescript's resolution support
export function manualModuleDefinition(name: string): ts.ResolvedModule {
	let options: CompilerOptions = {
		esModuleInterop: true,
		allowSyntheticDefaultImports: true,
		moduleResolution: ModuleResolutionKind.NodeJs,
		lib: ['esnext', 'dom'],
	}

	let host = createCompilerHost(options)
	let resolver = nodeModuleNameResolver(name, __filename, options, host)

	let result = resolver.resolvedModule!
	return result

	// // const modulePath = (require.resolve.paths(name) || []).map(p => resolve(p, name)).find(existsSync)
	// const modulePath = dirname(require.resolve(name))
	// if (modulePath == null) throw new Error(`unable to find ${name}`)

	// const resolvedFileName = join(modulePath, 'index.d.ts')

	// ts.ModuleResolutionKind

	// return {
	// 	resolvedFileName,
	// 	isExternalLibraryImport: true,
	// }
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
