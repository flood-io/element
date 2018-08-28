import * as findRoot from 'find-root'
import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

export default function ownPackage(): any {
	const root = findRoot(__dirname)
	const pkgFile = resolve(root, 'package.json')

	if (!existsSync(pkgFile)) {
		throw new Error('no package.json found')
	}

	return JSON.parse(readFileSync(pkgFile, 'utf8'))
}
