import { join } from 'path'
import glob from 'glob'

export async function readConfigFile(file: string): Promise<any> {
	const rootPath = process.cwd()
	try {
		return await import(join(rootPath, file))
	} catch {
		throw Error('The config file was not structured correctly. Please check and try again')
	}
}

export function getFilesPattern(testPathMatch?: string[]) {
	if (!testPathMatch || !testPathMatch.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	const files: string[] = []
	const fileMatched = testPathMatch.reduce(
		(arr: string[], item: string) => arr.concat(glob.sync(item)),
		[],
	)
	files.push(...fileMatched)
	if (!files.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}

	return files
}
