import { Compiler, CompilerOutput } from '@flood/element-compiler'

export async function webpackCompiler(sourceFile: string): Promise<CompilerOutput> {
	const compiler = new Compiler(sourceFile, true)
	return compiler.emit()
}
