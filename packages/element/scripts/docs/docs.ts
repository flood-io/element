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
const apiDir = join(bookDir, 'api')

// import * as recast from 'recast'
import * as ts from 'typescript'

const fileName = join(root, 'index.ts')

const s = ts.createSourceFile(
	fileName,
	readFileSync(fileName).toString(),
	ts.ScriptTarget.ES2015,
	/* setParentNodes */ true,
)

let indexMap: { [key: string]: string } = {}
const indexExports: { [key: string]: string } = {}

function getDocTag(node): string | undefined {
	const tag = node.jsDoc && node.jsDoc[0] && node.jsDoc[0].tags && node.jsDoc[0].tags[0]
	if (tag === undefined) return

	if (tag.tagName.escapedText === 'docPage') {
		return tag.comment
	}
}

function getExport(node) {
	const docPage = getDocTag(node)
	if (docPage === undefined) return

	let srcFile = node.moduleSpecifier.text
	if (srcFile.startsWith('./')) srcFile = srcFile.slice(2)

	// if (!indexMap[srcFile]) indexMap[srcFile] = []

	indexMap = node.exportClause.elements.reduce((indexMap, exportDef) => {
		const name = exportDef.name.escapedText
		if (name === undefined) return indexMap

		indexMap[`${srcFile}.${name}`] = docPage
		indexExports[name] = docPage

		return indexMap
	}, indexMap)
}

ts.forEachChild(s, node => {
	if (node.kind === ts.SyntaxKind.ExportDeclaration) {
		getExport(node)
	}
})

debug('indexMap', indexMap)
debug('indexExports', indexExports)

function commentFromNode(node) {
	let { comment: { shortText, text } = { shortText: null, text: null } } = node
	return [shortText, text].filter(t => t && t.length).join('\n\n')
}
function isNodeInternal(node) {
	if (node && node.comment && node.comment.tags) {
		return node.comment.tags.find(t => t.tag === 'internal')
	} else if (node && node.signatures) {
		return node.signatures.some(isNodeInternal)
	}
	return false
}
function isNodeOpaque(node) {
	if (node && node.comment && node.comment.tags) {
		return node.comment.tags.find(t => t.tag === 'opaque')
	}
	return false
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

function stripQuotes(name: string): string {
	if (name.startsWith('"') && name.endsWith('"')) {
		return name.slice(1, name.length - 1)
	} else {
		return name
	}
}

// function filePathForNameAndType(kind: string, name: string): string {
// const path = maybeFilePathForNameAndType(kind, name)
// if (path === undefined) {
// throw new Error(`unable to find file path for kind: ${kind}`)
// }
// return path
// }

interface Comment {
	shortText: string
	text: string
}

type RefsMap = Map<string, { target: string }>

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

		switch (this.input.type) {
			case 'intrinsic':
				return `${this.input.name}`
			case 'stringLiteral':
				return this.input.value
			case 'array':
				let formatter = new ParamTypeFormatter(this.input.elementType)
				return `${formatter.toString()}[]`
			case 'union':
				let formattedArgs = this.input.types.map(t => new ParamTypeFormatter(t).toString())
				return `${formattedArgs.join('|')}`
			case 'reflection':
				return new ReflectedDeclarationFormatter(this.input.declaration).toString()
			case 'reference':
				if (this.input.name === 'Promise') {
					let formattedArgs = (this.input.typeArguments || []).map(t =>
						new ParamTypeFormatter(t).toString(),
					)
					return `[Promise]&lt;${formattedArgs.join('|')}&gt;`
				} else {
					return `[${this.input.name}]`
				}
			default:
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
		let t = `&lt;${formattedType}&gt;`

		if (name.startsWith('returns')) {
			this.writeLine(`* ${name} ${t} ${desc}`)
		} else {
			this.writeLine(`* \`${name}\` ${t} ${isOptional ? '(Optional)' : ''} ${desc}`)
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

		this.referencesNeeded.forEach(name => {
			// debug('applyReferences -> ', name)
			let link: string
			const ref = references.get(name)
			if (!ref) return
			const { target } = ref

			if (target.startsWith('http')) {
				link = target
			} else {
				link = `${relative(apiDir, target)}#${generateAnchor(name)}`
			}

			// if (title === null) title = undefined
			refs.set(name, { target: link })
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

// function exportKey(node): string {
// return `${stripQuotes(node.name)}.${node.name}`
// }
// }

class parseCtx {
	constructor(public mod: string, public docSource: DocsParser) {}

	forMod(mod: string): parseCtx {
		return new parseCtx(stripQuotes(mod), this.docSource)
	}

	docForKey(key: string): MarkdownDocument {
		const fullKey = `${this.mod}.${key}`
		const pageName = indexMap[fullKey]
		debug('fullKey %s pageName %s', fullKey, pageName)

		if (pageName === undefined) return this.docSource.catchallDoc

		const path = `api/${pageName}.md`

		return this.docSource.getDoc(path)
	}
}

class DocsParser {
	title: string

	references: Map<string, { target: string; title?: string }> = new Map()
	summaryParts: string[] = []
	enumerations: MarkdownDocument[] = []

	public docs: Map<string, MarkdownDocument> = new Map()
	public catchallDoc = MarkdownDocument.nullDoc()
	getDoc(pageName: string): MarkdownDocument {
		if (!this.docs.has(pageName)) {
			this.docs.set(pageName, new MarkdownDocument(pageName))
		}
		return this.docs.get(pageName) || this.catchallDoc
	}

	// seenModule: Map<string, boolean> = new Map()

	constructor(public docsJSON: any) {
		debug('README', join(root, 'README.md'), join(bookDir, 'README.md'))
		mkdirpSync(bookDir)
		copySync(join(root, 'README.md'), join(bookDir, 'README.md'))

		for (const [key, target] of Object.entries(internalRefs)) {
			this.addReference(key, target)
		}

		for (const [key, target] of Object.entries(indexExports)) {
			const path = `api/${target}.md`
			this.addReference(key, path)
			console.log('adding', key, path, `[${key}](${path}#${generateAnchor(key)})`)
			this.summaryParts.push(`[${key}](${path}#${generateAnchor(key)})`)
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
		this.docsJSON.children.forEach(child => this.processTopLevelNode(child))

		this.createSummary()
		this.writeDocsToFiles()
	}

	private processTopLevelNode(node) {
		debug('processTopLevelNode')
		const { name, kindString } = node

		debug('name: %s, kind: %s', name, kindString)
		// if (this.seenModule(node)) return

		const ctx = new parseCtx('top', this)

		this.processNode(ctx, node)
	}

	// seenModule(node): boolean {
	// return node.kindString === 'External module' &&
	// }

	/**
	 * Translates the node type and name to a relative file path, and ensures the file exists
	 */
	// docForNode(node): MarkdownDocument | undefined {
	// let { name } = node
	// // debug('maybeFilePathForNameAndType(%s, %s)', kind, name)
	// name = stripQuotes(name)

	// // const unmapped = indexMap[name]
	// // if (!unmapped) {
	// // return undefined
	// // }

	// const paths = {
	// 'src/page/Enums': 'api/Constants.md',

	// 'src/page/By': 'api/By.md',
	// 'src/page/Until': 'api/Until.md',

	// 'src/runtime/types': 'api/Browser.md',
	// 'src/page/types': 'api/Page.md',
	// 'src/page/TargetLocator': 'api/Page.md',

	// 'src/runtime/Step': 'api/DSL.md',
	// 'src/runtime/Settings': 'api/DSL.md',
	// 'src/runtime-environment/types': 'api/DSL.md',

	// 'src/test-data/TestData': 'api/TestData.md',
	// 'src/test-data/TestDataFactory': 'api/TestData.md',
	// }

	// if (!paths[name]) {
	// return undefined
	// }

	// const docPath = paths[name]

	// if (!this.docs.has(docPath)) this.docs.set(docPath, new MarkdownDocument(docPath, name))

	// return this.docs.get(docPath)

	// // debug('n', node)
	// // const resolved = maybeFilePathForNameAndType(kindString, name)
	// // if (resolved === undefined) return
	// // const [resolvedName, resolvedPath] = resolved
	// // debug('resolved as path %s and name %s', resolvedPath, name)

	// // let doc = new MarkdownDocument(resolvedPath)
	// // if (!this.docs.has(resolvedPath)) this.docs.set(resolvedPath, [])

	// // const docsForPath = this.docs.get(resolvedPath)
	// // if (docsForPath) docsForPath.push(doc)
	// // return paths[name]

	// // let relativePath = paths[kind](name)
	// // debug('relativePath', relativePath)
	// // return relativePath
	// }

	private processNode(ctx, node) {
		debug('processNode', node.kindString, node.name)
		if (isNodeInternal(node)) {
			return
		}

		switch (node.kindString) {
			case 'Module':
			case 'Enumeration':
			case 'Class':
			case 'Interface':
				this.processClass(ctx, node)
				break
			case 'Function':
				debug('found a function ', node.name)
				this.processFunction(ctx, node)
				break
			case 'Type alias':
				this.processAlias(ctx, node)
				break
			case 'External module':
				this.processExternalModule(ctx, node)
				break
			case 'Object literal':
				this.processObjectLiteral(ctx, node)
			default:
				console.warn(`unknown kind ${node.kindString}`)
				return
		}
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
		debug('writeDocsToFiles()')
		this.applyReferencesToHandWrittenDocs()
		let contents: Map<string, string[]> = new Map()
		// debug('docs', this.docs)
		this.docs.forEach((doc, path) => {
			if (!doc.shouldWrite) return

			// docs.forEach(doc => {
			doc.applyReferences(this.references)
			let absPath = join(bookDir, path)
			if (!contents.has(absPath)) contents.set(absPath, [])

			const content = contents.get(absPath)
			if (content) content.push(doc.toString())
			// })
		})
		contents.forEach((content, absPath) => {
			createFileSync(absPath)
			writeFileSync(absPath, content.join('\n'))
		})
	}

	private addReference(name: string, pathOrDoc: MarkdownDocument | string) {
		let target: string
		if (typeof pathOrDoc === 'string') {
			target = pathOrDoc
		} else if ((<MarkdownDocument>pathOrDoc).path !== undefined) {
			target = (<MarkdownDocument>pathOrDoc).path
		} else {
			return
		}

		debug('addReference', name, target)
		this.references.set(name, { target })
	}

	private createSummary() {
		const doc = this.getDoc('SUMMARY.md')
		// const doc = this.getDoc(new MarkdownDocument('SUMMARY.md')
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

		// let sortedMethods: string[] = this.summaryParts

		// debug('createSummary %O', this.summaryParts)
		// this.summaryParts.forEach((links, name) => {
		// links.forEach(m => {
		// sortedMethods.push(m)
		// })
		// })

		this.summaryParts
			.sort()
			// .sort((a, b) => a.toLowerCase() - b.toLowerCase())
			.forEach(m => {
				doc.writeBullet(m, 2)
			})

		// this.docs.set('Index', doc)

		// doc = new MarkdownDocument('Enumerations.md')
		// doc.writeHeading('Enumerations')
		// doc.writeLine(
		// 'Here you will find a list of all the possible values for fields which accept a typed enumerated property, such as `userAgent` or `click()`',
		// )
		// const enumDoc = this.docs.get('Enumeration')
		// if (enumDoc) enumDoc.unshift(doc)
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

	private processFunction(ctx, node) {
		const doc = ctx.docForKey(node.name)

		node.signatures.forEach(sig => {
			this.addReference(
				sig.name,
				doc,
				// '', // TODO
				// `${join(bookDir, filePathForNameAndType('Function', node.name))}#${generateAnchor(
				// sig.name,
				// )}`,
			)
			this.processCallSignature(doc, sig, null)
		})
	}

	private processAlias(ctx, node) {
		// console.log(node)
		const doc = ctx.docForKey(node.name)

		doc.writeHeading(`\`${node.name}\``)
		doc.writeComment(node.comment)

		this.addReference(node.name, doc)

		// node.signatures.forEach(sig => {
		// 	this.addReference(sig.name, join(bookDir, filePathForNameAndType('Type alias', node.name)))
		// 	this.processCallSignature(doc, sig, null)
		// })
	}

	private processObjectLiteral(ctx, node) {
		debug('processObjectLiteral', node)
		const doc = ctx.docForKey(node.name)

		doc.writeHeading(`\`${node.name}\``)
		doc.writeComment(node.comment)
		this.processObject(doc, node.name, node.children)
		this.addReference(node.name, doc)
	}

	private processExternalModule(ctx, node) {
		debug('processExternalModule', node)

		if (!node.children) {
			return
		}

		const modCtx = ctx.forMod(node.name)
		node.children.forEach(node => this.processNode(modCtx, node))
	}

	private processClass(ctx, node) {
		let { name, children } = node
		debug('processClass', name, children)

		const doc = ctx.docForKey(name)

		// 1. Create file and reference
		doc.writeSection(`\`${name}\``)
		doc.writeComment(node.comment)

		if (isNodeOpaque(node)) return

		if (!children) children = []

		children
			.filter(node => node.kindString === 'Method')
			.forEach(node => this.processClass_Method(doc, name, node))

		children
			.filter(node => node.kindString === 'Property')
			.forEach(node => this.processClass_Property(doc, name, node))

		let members = children.filter(node => node.kindString === 'Enumeration member')

		if (members.length) {
			this.processObject(doc, name, members, 'Member')
			// doc.writeTableHeader('Member', 'Default Value', 'Comment')
			// members.forEach(node => this.processMember(name, node, doc))
		}

		// console.log(children.filter(node => !['Method', 'Property'].includes(node.kindString)))
	}

	private processClass_Method(doc, parent, node) {
		if (isNodeInternal(node)) return

		node.signatures.forEach(sig => {
			this.processCallSignature(doc, sig, parent)
			if (doc.filePath) {
				let name = `${camelcase(parent)}.${sig.name}`
				this.addReference(name, doc)
			}
		})
	}

	private processClass_Property(doc, parent, node) {
		if (isNodeInternal(node)) return

		let { name, flags, type } = node
		let comment = commentFromNode(node)

		// comment rendered as part of an unordered list, so indent
		comment = '  ' + comment.replace(/\n/g, '  \n  ') + '  '

		doc.writeParameterLine(name, type, comment, !!flags.isOptional)
	}

	private processObject(doc, parent, members, thing = 'Name') {
		doc.writeTable([
			[thing, 'Default Value', 'Comment'],
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
