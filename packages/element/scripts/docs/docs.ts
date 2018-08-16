import { join, relative } from 'path'
import * as table from 'markdown-table'
import * as camelcase from 'lodash.camelcase'
import * as glob from 'glob'
import * as frontMatter from 'front-matter'
import * as yaml from 'js-yaml'
import { mkdirpSync, copySync, createFileSync, writeFileSync, readFileSync } from 'fs-extra'

import * as debugFactory from 'debug'
const debug = debugFactory('element:docs')

const root = join(__dirname, '../..')
const bookDir = join(root, 'docs')

function commentFromNode(node) {
	let { comment: { shortText, text } = { shortText: null, text: null } } = node
	return [shortText, text].filter(t => t && t.length).join('\n\n')
}

function findReferences(text: string): string[] {
	let r = /\[(\w+)\]/gi
	let matches = r.exec(text)
	if (matches) {
		let [, ...rest] = matches
		return rest
	}

	return []
}

function generateAnchor(name: string): string {
	return name
		.toLowerCase()
		.replace(/\s+/gi, '-')
		.replace(/[^a-z0-9-]/gi, '')
}

/**
 * Translates the node type and name to a relative file path, and ensures the file exists
 */
function filePathForNameAndType(kind: string, name: string): string {
	let paths = {
		Class: name => join('api', `${name}.md`),
		Interface: name => join('api', `Interfaces.md`),
		Module: name => join('api', `${name}.md`),
		Function: name => join('api', `Functions.md`),
		'Type alias': name => join('api', `Interfaces.md`),
		Enumeration: name => join('api', `Interfaces.md`),
		Variable: name => join('api', `Interfaces.md`),
		Index: name => name,
	}

	if (!paths[kind]) {
		throw new Error(`Unknown language construct: ${kind}`)
	}

	let relativePath = paths[kind](name)
	return relativePath
}

interface Comment {
	shortText: string
	text: string
}

type RefsMap = Map<string, { target: string; title?: string }>

type ParamType =
	| { type: 'intrinsic'; name: string }
	| { type: 'reference'; name: string | 'Promise'; typeArguments?: ParamType[] }
	| { type: 'stringLiteral'; value: string }
	| { type: 'reflection'; declaration: any }
	| { type: 'array'; elementType: ParamType }
	| { type: 'union'; types: ParamType[] }

class ParamTypeFormatter {
	constructor(public input: ParamType) {}

	public toString() {
		let { type } = this.input

		if (this.input.type === 'intrinsic') {
			return `${this.input.name}`
		} else if (this.input.type === 'stringLiteral') {
			return this.input.value
		} else if (this.input.type === 'array') {
			let formatter = new ParamTypeFormatter(this.input.elementType)
			return `${formatter.toString()}[]`
		} else if (this.input.type === 'union') {
			let formattedArgs = this.input.types.map(t => new ParamTypeFormatter(t).toString())
			return `${formattedArgs.join('|')}`
		} else if (this.input.type === 'reflection') {
			return new ReflectedDeclarationFormatter(this.input.declaration).toString()
		} else if (this.input.type === 'reference') {
			if (this.input.name === 'Promise') {
				let formattedArgs = (this.input.typeArguments || []).map(t =>
					new ParamTypeFormatter(t).toString(),
				)
				return `[Promise]<${formattedArgs.join('|')}>`
			} else {
				return `[${this.input.name}]`
			}
		} else {
			console.assert(true, `Found unknown type: "${type}"`)
		}
	}
}

type Variable = {
	id: string
	name: string
	kindString: 'Variable'
	flags: object
	type: ParamType
}
type CallSignature = {
	name: '__call'
	kindString: 'Call signature'
	type: ParamType
}
type ReflectedDeclaration = {
	name: '__type'
	kindString: 'Type literal'
	children?: Variable[]
	signatures?: CallSignature[]
}

class ReflectedDeclarationFormatter {
	constructor(public declaration: ReflectedDeclaration | Variable | CallSignature) {}

	toString() {
		if (this.declaration.kindString === 'Type literal') {
			if (this.declaration.children) {
				let children = this.declaration.children
					.map(child => new ReflectedDeclarationFormatter(child).toString())
					.reduce((memo, obj) => {
						memo = { ...obj, ...memo }
						return memo
					}, {})
				return JSON.stringify(children)
			}
		} else if (this.declaration.kindString === 'Variable') {
			let { name, type } = this.declaration
			let formattedType = new ParamTypeFormatter(type)
			let obj = {}
			obj[name] = formattedType.toString()
			return obj
		}
	}
}

interface FrontMatter {
	title: string
}

class MarkdownDocument {
	constructor(
		public path: string,
		public lines: string[] = [],
		public referencesNeeded: string[] = [],
		public enableReferences = true,
		public frontMatter: FrontMatter = { title: '' },
	) {}

	static fromFile(path: string) {
		let doc = new MarkdownDocument(path)
		let content = readFileSync(path).toString('utf8')

		let matter = frontMatter<FrontMatter>(content)
		doc.frontMatter = matter.attributes
		doc.lines = matter.body.split('\n')

		doc.referencesNeeded = findReferences(matter.body)
		return doc
	}

	public writeLine(text: string = '') {
		this.referencesNeeded = [...this.referencesNeeded, ...findReferences(text)]
		this.writeLineRaw(text)
	}

	public writeHeading(text: string, depth: number = 1) {
		this.writeLine(`${'#'.repeat(depth)} ${text}`)
	}

	public writeBullet(text: string, depth: number = 1) {
		let b = ` `.repeat(depth)
		this.writeLine(`${b}* ${text}`)
	}

	public writeParameterLine(name: string, type: ParamType, desc: string = '', isOptional = false) {
		let formattedType = new ParamTypeFormatter(type).toString()
		let t = `<${formattedType}>`

		if (name.startsWith('returns')) {
			this.writeLine(`* ${name} ${t} ${desc.trim()}`)
		} else {
			this.writeLine(`* \`${name}\` ${t} ${isOptional ? '(Optional)' : ''} ${desc.trim()}`)
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

		this.referencesNeeded.forEach(ref => {
			let { target, title } = references.get(ref) || { target: '', title: null }

			if (target.length > 0) {
				if (!target.startsWith('http')) {
					target = relative(join(bookDir, 'api'), target)
				}
				if (title === null) title = undefined
				if (references.has(ref)) refs.set(ref, { target, title })
			}
		})

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

class DocsParser {
	title: string

	references: Map<string, { target: string; title?: string }> = new Map()
	summaryParts: Map<string, string[]> = new Map()
	enumerations: MarkdownDocument[] = []

	docs: Map<string, MarkdownDocument[]> = new Map()

	constructor(public docsJSON: string) {
		mkdirpSync(bookDir)
		copySync(join(root, 'README.md'), join(bookDir, 'README.md'))

		for (const [key, target] of Object.entries(internalRefs)) {
			this.references.set(key, { target })
		}
	}

	/**
	 * This method processes the entire documentation AST and returns documentation.
	 *
	 * Steps:
	 * 1. Build Markdown documents for each "kind"
	 * 2. Create a reference list of each Kind and method/property linking to the file it belongs to.
	 * 3. Find all references mentioned in all markdown documents and append these references to those files.
	 *
	 * @memberof DocsParser
	 */
	process() {
		debug('process', docsJSON.children)
		let mainModule = docsJSON.children.find(n => n.name === '"index"')
		debug('mm', mainModule)
		mainModule.children.forEach(child => {
			let doc = new MarkdownDocument(filePathForNameAndType(child.kindString, child.name))
			if (!this.docs.has(child.kindString)) this.docs.set(child.kindString, [])

			debug('child.kindString', child.kindString)

			if (child.kindString === 'Module') {
				this.processClass(doc, child)
			} else if (child.kindString === 'Enumeration') {
				this.processClass(doc, child)
			} else if (child.kindString === 'Class') {
				this.processClass(doc, child)
			} else if (child.kindString === 'Interface') {
				this.processClass(doc, child)
			} else if (child.kindString === 'Function') {
				this.processFunction(doc, child)
			} else if (child.kindString === 'Type alias') {
				this.processAlias(doc, child)
			}

			const kind = this.docs.get(child.kindString)
			if (kind) kind.push(doc)
			// let relativePath = filePathForNameAndType(node.kindString, name)

			this.addReference(child.name, `${join(bookDir, doc.path)}#${generateAnchor(child.name)}`)

			if (!this.summaryParts.has(child.name)) this.summaryParts.set(child.name, [])
			const part = this.summaryParts.get(child.name)
			if (part) part.push(`[${child.name}](${doc.path}#${generateAnchor(child.name)})`)
		})

		this.createSummary()
		this.writeDocsToFiles()
	}

	public applyReferencesToHandWrittenDocs() {
		let files = glob.sync('docs/**/*.md')
		files.forEach(path => {
			let doc = MarkdownDocument.fromFile(path)
			doc.applyReferences(this.references)
			createFileSync(path)
			writeFileSync(path, doc.toString())
		})
	}

	public writeDocsToFiles() {
		this.applyReferencesToHandWrittenDocs()
		let contents: Map<string, string[]> = new Map()
		this.docs.forEach((docs, path) => {
			docs.forEach(doc => {
				doc.applyReferences(this.references)
				let absPath = join(bookDir, doc.path)
				if (!contents.has(absPath)) contents.set(absPath, [])

				const content = contents.get(absPath)
				if (content) content.push(doc.toString())
			})
		})
		contents.forEach((content, absPath) => {
			createFileSync(absPath)
			writeFileSync(absPath, content.join('\n'))
		})
	}

	private addReference(name, target, title?) {
		if (!name) return
		if (!target) return
		this.references.set(name, { target, title })
	}

	private createSummary() {
		let doc = new MarkdownDocument('SUMMARY.md')
		doc.enableReferences = false
		doc.writeHeading('Documentation', 2)
		doc.writeLine('')
		doc.writeBullet('[Quick Start](README.md)')

		// Adds everything in the examples directory
		let examples = glob.sync('docs/examples/**/*.md')
		examples.forEach(file => {
			let content = readFileSync(file).toString('utf8')
			let { title } = frontMatter<FrontMatter>(content).attributes
			if (title) {
				let relativePath = relative(bookDir, file)
				doc.writeBullet(`[${title}](${relativePath})`)
			}
		})

		doc.writeLine('')

		doc.writeHeading('Flood Chrome API', 2)
		doc.writeLine('')

		let sortedMethods: string[] = []

		this.summaryParts.forEach((methods, name) => {
			methods.forEach(m => {
				sortedMethods.push(m)
			})
		})

		sortedMethods
			.sort()
			// .sort((a, b) => a.toLowerCase() - b.toLowerCase())
			.forEach(m => {
				doc.writeBullet(m, 2)
			})

		this.docs.set('Index', [doc])

		doc = new MarkdownDocument('Enumerations.md')
		doc.writeHeading('Enumerations')
		doc.writeLine(
			'Here you will find a list of all the possible values for fields which accept a typed enumerated property, such as `userAgent` or `click()`',
		)
		const enumDoc = this.docs.get('Enumeration')
		if (enumDoc) enumDoc.unshift(doc)
	}

	private processCallSignature(doc, sig, prefix?) {
		let { name, type, parameters = [] } = sig

		if (prefix) name = `${camelcase(prefix)}.${name}`

		let params: any[] = []
		parameters.forEach(p => {
			let { name, type, flags: { isOptional = false } } = p
			let desc = commentFromNode(p)
			params.push({ name, desc, type, isOptional })
		})

		let required = params
			.filter(p => !p.isOptional)
			.map(p => p.name)
			.join(`, `)
		let optional = params
			.filter(p => p.isOptional)
			.map(p => p.name)
			.join(`, `)

		name = `\`${name}(${required}${optional.length ? `[, ${optional}]` : ''})\``
		this.writeCallSignature(doc, name, sig.comment, params, type)
	}

	private writeCallSignature(
		doc: MarkdownDocument,
		name: string,
		comment: Comment,
		params: {
			name: string
			type: ParamType
			desc?: string
			isReference: boolean
			isOptional: boolean
		}[],
		returnType?: any,
	) {
		doc.writeHeading(`${name}`, 4)

		params.forEach(param => {
			if (param.name && param.type)
				doc.writeParameterLine(param.name, param.type, param.desc, param.isOptional)
		})

		if (returnType) doc.writeParameterLine('returns:', returnType)

		doc.writeLine()
		doc.writeComment(comment)
	}

	private processFunction(doc, node) {
		node.signatures.forEach(sig => {
			this.addReference(
				sig.name,
				`${join(bookDir, filePathForNameAndType('Function', node.name))}#${generateAnchor(
					sig.name,
				)}`,
			)
			this.processCallSignature(doc, sig, null)
		})
	}

	private processAlias(doc: MarkdownDocument, node) {
		// console.log(node)

		doc.writeHeading(`\`${node.name}\``)

		// node.signatures.forEach(sig => {
		// 	this.addReference(sig.name, join(bookDir, filePathForNameAndType('Type alias', node.name)))
		// 	this.processCallSignature(doc, sig, null)
		// })
	}

	private processClass(doc, node) {
		let { name, children } = node

		// 1. Create file and reference
		doc.writeSection(`\`${name}\``)
		doc.writeComment(node.comment)

		// this.summaryParts.set(name, [])

		if (!children) children = []

		children
			.filter(node => node.kindString === 'Method')
			.forEach(node => this.processMethod(name, node, doc))

		children
			.filter(node => node.kindString === 'Property')
			.forEach(node => this.processProperty(name, node, doc))

		let members = children.filter(node => node.kindString === 'Enumeration member')

		if (members.length) {
			this.processMembers(name, members, doc)
			// doc.writeTableHeader('Member', 'Default Value', 'Comment')
			// members.forEach(node => this.processMember(name, node, doc))
		}

		// console.log(children.filter(node => !['Method', 'Property'].includes(node.kindString)))
	}

	private processMethod(parent, node, doc) {
		node.signatures.forEach(sig => {
			this.processCallSignature(doc, sig, parent)
			if (doc.filePath) {
				let name = `${camelcase(parent)}.${sig.name}`
				this.addReference(name, `${join(bookDir, doc.filePath)}#${generateAnchor(name)}`)
			}
		})
	}

	private processProperty(parent, node, doc) {
		let { name, flags, type } = node
		let comment = commentFromNode(node)
		doc.writeParameterLine(name, type, comment, flags.isOptional === true)
	}

	private processMembers(parent, members, doc: MarkdownDocument) {
		doc.writeTable([
			['Member', 'Default Value', 'Comment'],
			...members.map(node => {
				let { name, defaultValue } = node
				let comment = commentFromNode(node)
				return [`\`${name}\``, defaultValue ? defaultValue : '', comment ? comment : '']
			}),
		])
	}
}

const internalRefs = {
	void: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/void',
	null: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null',
	Array: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
	boolean: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Boolean_type',
	Buffer: 'https://nodejs.org/api/buffer.html#buffer_class_buffer',
	function:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
	number: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#Number_type',
	Object: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
	Promise:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
	string: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures#String_type',
	'stream.Readable': 'https://nodejs.org/api/stream.html#stream_class_stream_readable',
	Error: 'https://nodejs.org/api/errors.html#errors_class_error',
	ChildProcess: 'https://nodejs.org/api/child_process.html',
	iterator: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols',
	Element: 'https://developer.mozilla.org/en-US/docs/Web/API/element',
	Map: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map',
	selector: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors',
	'UIEvent.detail': 'https://developer.mozilla.org/en-US/docs/Web/API/UIEvent/detail',
	Serializable:
		'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#Description',
	xpath: 'https://developer.mozilla.org/en-US/docs/Web/XPath',
	UnixTime: 'https://en.wikipedia.org/wiki/Unix_time',
	Key: 'Enumerations.md/#key',
	MouseButtons: 'Enumerations.md/#mousebuttons',
	Device: 'Enumerations.md/#device',
}

const docsJSON = require(__dirname + '/../../docs.json')
const parser = new DocsParser(docsJSON)
try {
	parser.process()
} catch (err) {
	console.error(err)
}
