import { join, relative } from 'path'
import { readFileSync } from 'fs-extra'
import * as frontMatter from 'front-matter'
import * as table from 'markdown-table'
import * as yaml from 'js-yaml'
import { generateAnchor } from './generateAnchor'

import { typeToString, ParamType } from './Formatters'

const debug = require('debug')('element:docs')

const root = join(__dirname, '../..')
const bookDir = join(root, 'docs')
const apiDir = join(bookDir, 'api')

function findReferences(text: string): string[] {
	let r = /\[(\w+)\]/gi
	let allRefs: string[] = []

	let matches
	while ((matches = r.exec(text)) !== null) {
		let [, ref] = matches
		allRefs.push(ref)
	}

	return allRefs
}

export interface FrontMatter {
	title: string
}

export interface Comment {
	shortText: string
	text: string
}

type RefsMap = Map<string, { target: string }>

export class MarkdownDocument {
	public shouldWrite = true
	constructor(
		public path: string,
		public lines: string[] = [],
		public referencesNeeded: string[] = [],
		public enableReferences = true,
		public frontMatter: FrontMatter = { title: '' },
	) {}

	static nullDoc(): MarkdownDocument {
		const doc = new MarkdownDocument('')
		doc.shouldWrite = false
		return doc
	}

	static fromFile(path: string) {
		let doc = new MarkdownDocument(path)
		let content = readFileSync(path).toString('utf8')

		let matter = frontMatter<FrontMatter>(content)
		doc.frontMatter = matter.attributes

		doc.addLines(matter.body.split('\n'))

		// doc.truncateFootnotes()
		// doc.referencesNeeded = findReferences(matter.body)

		return doc
	}

	public addLines(lines: string[]) {
		const suffixMarker = '<!-- suffix -->'
		for (const line of lines) {
			if (line.includes(suffixMarker)) {
				this.writeLineRaw(line)
				break
			} else {
				this.writeLine(line)
			}
		}
	}

	public writeLine(text: string = '') {
		this.extractReferences(text)
		this.writeLineRaw(text)
	}

	public writeCodeBlock(text: string, language = 'typescript') {
		const fence = '```'
		this.writeLineRaw(`${fence}${language}`)
		this.writeLine(text)
		this.writeLineRaw(fence)
	}

	extractReferences(text: string) {
		this.referencesNeeded = this.referencesNeeded.concat(findReferences(text))
	}

	public writeHeading(text: string, depth: number = 1) {
		this.writeLine(`${'#'.repeat(depth)} ${text}`)
	}

	public writeBullet(text: string, depth: number = 1) {
		let b = ` `.repeat(depth)
		this.writeLine(`${b}* ${text}`)
	}

	public writeParameterLine(
		name: string,
		type: ParamType,
		desc: string = '',
		isOptional = false,
		defaultValue: any = undefined,
	) {
		debug('writeParameterLine %s %O', name, type)
		let formattedType = typeToString(type)
		let t = `&lt;${formattedType}&gt;`

		if (name.startsWith('returns')) {
			this.writeLine(`* ${name} ${t} ${desc}`)
		} else {
			let defaultValueString = ''
			if (defaultValue !== undefined) {
				defaultValueString = `(Optional, default: \`${defaultValue.toString()})\``
			} else if (isOptional) {
				defaultValueString = '(Optional)'
			}

			this.writeLine(`* \`${name}\` ${t}  ${defaultValueString} ${desc}`)
		}
	}

	public writeComment(comment: Comment) {
		let { shortText, text } = comment || { shortText: null, text: null }
		if (shortText) {
			this.writeLine(shortText)
			this.writeLine()
		}
		if (text) this.writeLine(text)
	}

	public writeSection(name: string) {
		// this.writeLine(`-------`)
		this.writeHeading(name, 1)
		this.writeLine()
	}

	public applyReferences(references: RefsMap) {
		if (!this.enableReferences) return
		let refs: RefsMap = new Map()

		debug('applyReferences', this.path, this.referencesNeeded)

		this.referencesNeeded.forEach(name => {
			// debug('applyReferences -> ', name)
			let link: string
			const ref = references.get(name)
			if (!ref) {
				console.debug(`unmet reference ${name}`)
				return
			}
			const { target } = ref

			if (target.startsWith('http')) {
				link = target
			} else {
				link = `${relative(apiDir, target)}#${generateAnchor(name)}`
			}

			// if (title === null) title = undefined
			refs.set(name, { target: link })
		})

		debug('final refs', refs)
		this.writeReferences(refs)
	}

	public writeTable(rows: string[][]) {
		let md = table(rows)
		this.writeLineRaw(md)
	}

	public writeTableHeader(...cols: string[]) {
		let str = cols.map(col => `| ${col} `).join('')
		this.writeLineRaw(str)
		this.writeLineRaw('-'.repeat(str.length))
	}

	public writeTableRow(...cols: string[]) {
		let str = cols.map(col => `| ${col} `).join('')
		this.writeLineRaw(str)
	}

	private writeReferences(references) {
		this.writeLineRaw('')
		references.forEach(({ title, target }, name) => {
			this.writeLineRaw(`[${name}]: ${target}${title ? `"${title}"` : ''}`)
		})
	}

	private writeLineRaw(text: string) {
		this.lines.push(text)
	}

	toString() {
		let { frontMatter, lines } = this
		if (Object.keys(frontMatter).length) {
			let matter = `---\n${yaml.safeDump(frontMatter)}---`
			lines = [matter, ...lines]
		}
		return lines.join(`\n`)
	}
}
