import { join } from 'path'
import { existsSync } from 'fs'

export const version: string = ((): string => {
	if (existsSync(join(__dirname, '../package.json'))) {
		// development (look in /src)
		return require('../package.json').version
	} else {
		// production (look in /dist/src)
		return require('../../package.json').version
	}
})()
