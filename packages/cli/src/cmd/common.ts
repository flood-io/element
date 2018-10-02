import { existsSync, statSync } from 'fs'

export function checkFile(file: string, paramName = 'Test script'): Error | undefined {
	if (!file.length) return new Error(`Please provide a ${paramName}`)

	if (!existsSync(file)) return new Error(`${paramName} '${file}' does not exist`)

	const stat = statSync(file)
	if (!stat.isFile() && !stat.isSymbolicLink())
		return new Error(`${paramName} '${file}' is not a file`)
}
