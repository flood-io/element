import { Compiler, CompilerOutput } from '@flood/element-compiler'
import { checkFile } from '../cmd/common'

export async function webpackCompiler(sourceFile: string): Promise<CompilerOutput> {
	const compiler = new Compiler(sourceFile, true)
	return compiler.emit()
}

export function validateFile(sourceFile: string): any {
	const fileErr = checkFile(sourceFile)
	if (fileErr) throw fileErr
	return sourceFile
}
