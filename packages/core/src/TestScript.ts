import WebpackCompiler from './test-script/WebpackCompiler'
import { ITestScript } from './interface/ITestScript'
import { join } from 'path'
import { tmpdir } from 'os'
import { writeFileSync } from 'fs-extra'
import { TestScriptOptions } from './TestScriptOptions'

export async function compileString(
	source: string,
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	const tmpFile = join(tmpdir(), filename ?? 'flood-element-test-script.ts')
	writeFileSync(tmpFile, Buffer.from(source), { encoding: 'utf8' })
	return new WebpackCompiler(tmpFile, testScriptOptions).compile()
}

export async function compileFile(
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript | undefined> {
	return new WebpackCompiler(filename, testScriptOptions).compile()
}

export async function mustCompileString(
	source: string,
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	const testScript = await compileString(source, filename, testScriptOptions)

	if (testScript.hasErrors) {
		throw new Error(`Unable to compile script ${filename}:\n${testScript.formattedErrorString}`)
	}

	return testScript
}

export async function mustCompileFile(
	filename: string,
	testScriptOptions?: TestScriptOptions,
): Promise<ITestScript> {
	try {
		const testScript = await compileFile(filename, testScriptOptions)
		if (testScript == null) {
			throw new Error(
				`Unable to compile script ${filename}:\nunable to read script at path ${filename}`,
			)
		}

		if (testScript.hasErrors) {
			throw new Error(
				`Error: Unable to compile Element script ${filename}: ${testScript.formattedErrorString}`,
			)
		}

		return testScript
	} catch {
		throw Error("This file couldn't be compiled")
	}
}
