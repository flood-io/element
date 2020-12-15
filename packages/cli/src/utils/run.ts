import { join } from 'path'
import glob from 'glob'
import { ElementConfig } from '@flood/element-core/src/ElementOption'

interface FilesPattern {
	files: string[]
	notExistingFiles: string[]
}

export async function readConfigFile(file: string): Promise<ElementConfig> {
	const rootPath = process.cwd()
	try {
		return await import(join(rootPath, file))
	} catch {
		throw Error('The config file was not structured correctly. Please check and try again')
	}
}

export function getFilesPattern(testPathMatch?: string[]): FilesPattern {
	if (!testPathMatch || !testPathMatch.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}
	const files: string[] = []
	const notExistingFiles: string[] = []
	const fileMatched = testPathMatch.reduce((arr: string[], item: string) => {
		const result = glob.sync(item)
		if (result.length === 0) {
			notExistingFiles.push(item)
		}

		return arr.concat(result)
	}, [])
	files.push(...fileMatched)
	if (!files.length) {
		throw Error('Found no test scripts matching testPathMatch pattern')
	}

	return {
		files,
		notExistingFiles,
	}
}
