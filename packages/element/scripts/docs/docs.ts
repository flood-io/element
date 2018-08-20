import { join, relative, basename } from 'path'
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

const indexMap: { [key: string]: string[] } = {}

function getExport(node) {
	let srcFile = node.moduleSpecifier.text
	if (srcFile.startsWith('./')) srcFile = srcFile.slice(2)

	if (!indexMap[srcFile]) indexMap[srcFile] = []

	const defs = node.exportClause.elements.map(x => x.name.escapedText)

	indexMap[srcFile] = indexMap[srcFile].concat(defs)
}

ts.forEachChild(s, node => {
	if (node.kind === ts.SyntaxKind.ExportDeclaration) {
		getExport(node)
	}
})

debug('indexMap', indexMap)

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
	constructor(
		public path: string,
		public symbolicName: string,
		public lines: string[] = [],
		public referencesNeeded: string[] = [],
		public enableReferences = true,
		public frontMatter: FrontMatter = { title: '' },
	) {}

	static fromFile(path: string) {
		let doc = new MarkdownDocument(path, basename(path, '.md'))
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

class DocsParser {
	title: string

	references: Map<string, { target: string; title?: string }> = new Map()
	summaryParts: Map<string, string[]> = new Map()
	enumerations: MarkdownDocument[] = []

	docs: Map<string, MarkdownDocument> = new Map()
	// seenModule: Map<string, boolean> = new Map()

	constructor(public docsJSON: any) {
		mkdirpSync(bookDir)
		copySync(join(root, 'README.md'), join(bookDir, 'README.md'))

		for (const [key, target] of Object.entries(internalRefs)) {
			this.addReference(key, target)
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
		// const topMods = this.docsJSON.children.map(n => [n.name, n.kindString])

		// const secondLevel = this.docsJSON.children
		// .reduce((secondLevel, c) => secondLevel.concat(c.children), [])
		// .filter(x => x)

		// let mainModule = this.docsJSON.children.find(n => n.name === '"index"')
		// debug('mm', mainModule)
		// mainModule.children.forEach(child => {
		this.docsJSON.children.forEach(child => this.processTopLevelNode(child))

		// TODO ASSEMBLE SUMMARY
		// let relativePath = filePathForNameAndType(node.kindString, name)

		// if (!this.summaryParts.has(resolvedName)) this.summaryParts.set(resolvedName, [])

		// const part = this.summaryParts.get(resolvedName)
		// if (part) part.push(`[${resolvedName}](${resolvedPath}#${generateAnchor(resolvedName)})`)

		// this.createSummary()
		this.writeDocsToFiles()
	}

	private processTopLevelNode(node) {
		debug('processTopLevelNode')
		const { name, kindString } = node

		debug('name: %s, kind: %s', name, kindString)
		// if (this.seenModule(node)) return

		const doc = this.docForNode(node)
		if (doc === undefined) return

		debug('doc', doc.path, doc.symbolicName)
		this.processNodeWithDoc([], node, doc)
	}

	// seenModule(node): boolean {
	// return node.kindString === 'External module' &&
	// }

	/**
	 * Translates the node type and name to a relative file path, and ensures the file exists
	 */
	docForNode(node): MarkdownDocument | undefined {
		let { name } = node
		// debug('maybeFilePathForNameAndType(%s, %s)', kind, name)
		name = stripQuotes(name)

		// const unmapped = indexMap[name]
		// if (!unmapped) {
		// return undefined
		// }

		const paths = {
			'src/page/Enums': 'api/Constants.md',

			'src/page/By': 'api/By.md',
			'src/page/Until': 'api/Until.md',

			'src/runtime/types': 'api/Browser.md',
			'src/page/types': 'api/Page.md',
			'src/page/TargetLocator': 'api/Page.md',

			'src/runtime/Step': 'api/DSL.md',
			'src/runtime/Settings': 'api/DSL.md',
			'src/runtime-environment/types': 'api/DSL.md',

			'src/test-data/TestData': 'api/TestData.md',
			'src/test-data/TestDataFactory': 'api/TestData.md',
		}

		if (!paths[name]) {
			return undefined
		}

		const docPath = paths[name]

		if (!this.docs.has(docPath)) this.docs.set(docPath, new MarkdownDocument(docPath, name))

		return this.docs.get(docPath)

		// debug('n', node)
		// const resolved = maybeFilePathForNameAndType(kindString, name)
		// if (resolved === undefined) return
		// const [resolvedName, resolvedPath] = resolved
		// debug('resolved as path %s and name %s', resolvedPath, name)

		// let doc = new MarkdownDocument(resolvedPath)
		// if (!this.docs.has(resolvedPath)) this.docs.set(resolvedPath, [])

		// const docsForPath = this.docs.get(resolvedPath)
		// if (docsForPath) docsForPath.push(doc)
		// return paths[name]

		// let relativePath = paths[kind](name)
		// debug('relativePath', relativePath)
		// return relativePath
	}

	private processNodeWithDoc(stack: string[], node, doc, resolvedName = node.name) {
		debug('processNodeWithDoc', stack, node.kindString, node.name, resolvedName)
		if (isNodeInternal(node)) {
			return
		}

		switch (node.kindString) {
			case 'Module':
			case 'Enumeration':
			case 'Class':
			case 'Interface':
				this.processClass(doc, node)
				break
			case 'Function':
				debug('found a function ', node.name)
				this.processFunction(doc, node)
				break
			case 'Type alias':
				this.processAlias(doc, node)
				break
			case 'External module':
				this.processExternalModule(stack, doc, node)
				break
			case 'Object literal':
				this.processObjectLiteral(doc, node)
			default:
				console.warn(`unknown kind ${node.kindString}`)
				return
		}

		this.addReference(resolvedName, doc.path)
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

	private addReference(name: string, target: string) {
		debug('addReference', name, target)
		this.references.set(name, { target })
	}

	// private createSummary() {
	// let doc = new MarkdownDocument('SUMMARY.md')
	// doc.enableReferences = false
	// doc.writeHeading('Documentation', 2)
	// doc.writeLine('')
	// doc.writeBullet('[Quick Start](README.md)')

	// // Adds everything in the examples directory
	// let examples = glob.sync('docs/examples/**/*.md')
	// examples.forEach(file => {
	// let content = readFileSync(file).toString('utf8')
	// let { title } = frontMatter<FrontMatter>(content).attributes
	// if (title) {
	// let relativePath = relative(bookDir, file)
	// doc.writeBullet(`[${title}](${relativePath})`)
	// }
	// })

	// doc.writeLine('')

	// doc.writeHeading('Flood Chrome API', 2)
	// doc.writeLine('')

	// let sortedMethods: string[] = []

	// this.summaryParts.forEach((methods, name) => {
	// methods.forEach(m => {
	// sortedMethods.push(m)
	// })
	// })

	// sortedMethods
	// .sort()
	// // .sort((a, b) => a.toLowerCase() - b.toLowerCase())
	// .forEach(m => {
	// doc.writeBullet(m, 2)
	// })

	// this.docs.set('Index', [doc])

	// doc = new MarkdownDocument('Enumerations.md')
	// doc.writeHeading('Enumerations')
	// doc.writeLine(
	// 'Here you will find a list of all the possible values for fields which accept a typed enumerated property, such as `userAgent` or `click()`',
	// )
	// const enumDoc = this.docs.get('Enumeration')
	// if (enumDoc) enumDoc.unshift(doc)
	// }

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
				doc.path,
				// '', // TODO
				// `${join(bookDir, filePathForNameAndType('Function', node.name))}#${generateAnchor(
				// sig.name,
				// )}`,
			)
			this.processCallSignature(doc, sig, null)
		})
	}

	private processAlias(doc: MarkdownDocument, node) {
		// console.log(node)

		doc.writeHeading(`\`${node.name}\``)
		doc.writeComment(node.comment)

		this.addReference(node.name, doc.path)

		// node.signatures.forEach(sig => {
		// 	this.addReference(sig.name, join(bookDir, filePathForNameAndType('Type alias', node.name)))
		// 	this.processCallSignature(doc, sig, null)
		// })
	}

	private processObjectLiteral(doc: MarkdownDocument, node) {
		debug('processObjectLiteral', node)
		doc.writeHeading(`\`${node.name}\``)
		doc.writeComment(node.comment)
		this.processObject(node.name, node.children, doc)
		this.addReference(node.name, doc.path)
	}

	private processExternalModule(stack, doc, node) {
		debug('processExternalModule', node)
		const nextStack = stack.concat(node.name)
		node.children.forEach(node => this.processNodeWithDoc(nextStack, node, doc))
	}

	private processClass(doc, node) {
		let { name, children } = node
		debug('processClass', name, children)

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
			this.processObject(name, members, doc, 'Member')
			// doc.writeTableHeader('Member', 'Default Value', 'Comment')
			// members.forEach(node => this.processMember(name, node, doc))
		}

		// console.log(children.filter(node => !['Method', 'Property'].includes(node.kindString)))
	}

	private processMethod(parent, node, doc) {
		if (isNodeInternal(node)) return

		node.signatures.forEach(sig => {
			this.processCallSignature(doc, sig, parent)
			if (doc.filePath) {
				let name = `${camelcase(parent)}.${sig.name}`
				this.addReference(name, doc.path)
			}
		})
	}

	private processProperty(parent, node, doc) {
		if (isNodeInternal(node)) return

		let { name, flags, type } = node
		let comment = commentFromNode(node)

		// comment rendered as part of an unordered list, so indent
		comment = '  ' + comment.replace(/\n/g, '  \n  ') + '  '

		doc.writeParameterLine(name, type, comment, !!flags.isOptional)
	}

	private processObject(parent, members, doc: MarkdownDocument, thing = 'Name') {
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
