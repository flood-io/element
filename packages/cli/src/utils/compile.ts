import { Compiler, CompilerOutput } from '@flood/element-compiler'
import { checkFile } from '../cmd/common'
import glob from 'glob'
import { join } from 'path'

export async function webpackCompiler(sourceFile: string): Promise<CompilerOutput> {
	const compiler = new Compiler(sourceFile, true)
	return compiler.emit()
}

export function validateFile(sourceFile: string): any {
	const fileErr = checkFile(sourceFile)
	if (fileErr) throw fileErr
	return sourceFile
}

export function getFilesPattern(pattern: string[]): string[] {
	if (!pattern || !pattern.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	const files: string[] = []
	try {
		files.push(
			...(pattern.reduce((arr: string[], item: string) => arr.concat(glob.sync(item)), []) as []),
		)
		if (!pattern.length) {
			throw Error('Found no test scripts matching testPathMatch pattern')
		}
	} catch {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	return files
}

export async function readConfigFile(file: string) {
	const rootPath = process.cwd()
	try {
		return await import(join(rootPath, file))
	} catch {
		throw Error('The config file was not structured correctly. Please check and try again')
	}
}
