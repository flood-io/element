import { join } from 'path'

// import * as debugFactory from 'debug'
// const debug = debugFactory('element:docs')

export function parsePuppeteer(): any {
	const puppeteerDoc = require(join(__dirname, '../..', 'puppeteer-1.6-docs.json'))
	const puppeteerTypes = puppeteerDoc.children.find(
		({ name }) => name === '"@types/puppeteer/index.d"',
	).children

	// puppeteerTypes.forEach(t => debug('puppeteer.%s', t.name))

	return puppeteerTypes
}
