import { join, relative, resolve, isAbsolute } from 'path'
import * as camelcase from 'lodash.camelcase'
// import * as upperFirst from 'lodash.upperfirst'
import * as glob from 'glob'
import { mkdirpSync, copySync, createFileSync, writeFileSync, readFileSync } from 'fs-extra'
import * as frontMatter from 'front-matter'

import { preParseIndex } from './preParseIndex'
import { parsePuppeteer } from './puppeteer'
import { generateAnchor } from './generateAnchor'
import { MarkdownDocument, FrontMatter, Comment } from './MarkdownDocument'
import { ParamType, typeToString } from './Formatters'

import * as debugFactory from 'debug'
const debug = debugFactory('element:docs')

const repoRoot = join(__dirname, '../../../..')
const root = join(__dirname, '../..')
const bookDir = join(root, 'docs')

const { indexMap, indexExports } = preParseIndex(join(root, 'index.ts'))

const puppeteerJSON = parsePuppeteer()

debug('indexMap', indexMap)
debug('indexExports', indexExports)

function commentFromNode(node) {
	const { comment: { shortText, text } = { shortText: null, text: null } } = node
	return [shortText, text].filter((t) => t && t.length).join('\n\n')
}
function isNodeInternal(node) {
	if (node && node.comment && node.comment.tags) {
		return node.comment.tags.find((t) => t.tag === 'internal')
	} else if (node && node.signatures) {
		return node.signatures.some(isNodeInternal)
	}
	return false
}
function isNodeOpaque(node) {
	if (node && node.comment && node.comment.tags) {
		return node.comment.tags.find((t) => t.tag === 'docopaque')
	}
	return false
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

	public puppeteerTypes: any

	constructor(public docsJSON: any, public puppeteerJSON: any) {
		mkdirpSync(bookDir)

		debug('README', join(repoRoot, 'README.md'), join(bookDir, 'README.md'))
		copySync(join(repoRoot, 'README.md'), join(bookDir, 'README.md'))

		for (const [key, target] of Object.entries(externalRefs)) {
			this.addReference(key, target)
		}

		console.log(Object.keys(indexExports))

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
		console.log('processing')
		this.docsJSON.children.forEach((child) => this.processTopLevelNode(child))

		const ctx = new parseCtx('puppeteer', this)
		this.puppeteerJSON.forEach((child) => this.processNode(ctx, child)) //, this.puppeteerJSON)

		console.log('creating summary')
		this.createSummary()

		console.log('writing')
		this.writeDocsToFiles()

		this.rewriteReadmePaths()
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
				break
			case 'Variable':
				this.processVariable(ctx, node)
				break
			default:
				console.warn(`unknown kind ${node.kindString} (${node.name})`)
				return
		}
	}

	public applyReferencesToHandWrittenDocs() {
		const files = glob.sync('docs/**/*.md')
		files.forEach((path) => {
			const doc = MarkdownDocument.fromFile(path)
			doc.applyReferences(this.references)
			createFileSync(path)
			writeFileSync(path, doc.toString())
		})
	}

	public writeDocsToFiles() {
		debug('writeDocsToFiles()')
		this.applyReferencesToHandWrittenDocs()
		const contents: Map<string, string[]> = new Map()
		// debug('docs', this.docs)
		this.docs.forEach((doc, path) => {
			if (!doc.shouldWrite) return

			// docs.forEach(doc => {
			doc.applyReferences(this.references)
			const absPath = join(bookDir, path)
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
		const examples = glob.sync('docs/examples/**/*.md')
		examples.forEach((file) => {
			const content = readFileSync(file).toString('utf8')
			const { title } = frontMatter<FrontMatter>(content).attributes
			if (title) {
				const relativePath = relative(bookDir, file)
				doc.writeBullet(`[${title}](${relativePath})`)
			}
		})

		doc.writeLine('')

		doc.writeHeading('Flood Element API', 2)
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
			.forEach((m) => {
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

		if (prefix) name = `${prefix}.${name}`

		const params: any[] = []
		parameters.forEach((p) => {
			const {
				name,
				type,
				flags: { isOptional = false },
				defaultValue,
			} = p
			const desc = commentFromNode(p)
			params.push({ name, desc, type, isOptional, defaultValue })
		})

		const required = params
			.filter((p) => !p.isOptional)
			.map((p) => p.name)
			.join(`, `)
		const optional = params
			.filter((p) => p.isOptional)
			.map((p) => p.name)
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
			defaultValue: any
		}[],
		returnType?: any
	) {
		doc.writeHeading(`${name}`, 4)

		params.forEach((param) => {
			if (param.name && param.type)
				doc.writeParameterLine(
					param.name,
					param.type,
					param.desc,
					param.isOptional,
					param.defaultValue
				)
		})

		if (returnType) doc.writeParameterLine('returns:', returnType)

		doc.writeLine()
		doc.writeComment(comment)
	}

	private processFunction(ctx, node) {
		const doc = ctx.docForKey(node.name)

		node.signatures.forEach((sig) => {
			this.addReference(
				sig.name,
				doc
				// '', // TODO
				// `${join(bookDir, filePathForNameAndType('Function', node.name))}#${generateAnchor(
				// sig.name,
				// )}`,
			)
			this.processCallSignature(doc, sig, null)
		})
	}

	private processAlias(ctx, node) {
		debug('processAlias', node.name, ctx.mod, node)
		const doc = ctx.docForKey(node.name)

		doc.writeHeading(`\`${node.name}\``, 2)
		doc.writeComment(node.comment)

		this.addReference(node.name, doc)

		// console.dir(node, { depth: null })
		// const f = new ReflectedDeclarationFormatter(node)
		// debug('f', f.toString())

		switch (node.type.type) {
			// case 'reflection':
			// debug('sigs %O', node.type.declaration.signatures)
			// if (node.type.declaration.signatures) {
			// node.type.declaration.signatures.forEach(sig => {
			// // this.addReference(sig.name, join(bookDir, filePathForNameAndType('Type alias', node.name)))
			// this.processCallSignature(doc, sig, null)
			// })
			// }
			// break
			case 'union':
				this.processAlias_union(doc, node)
				break
			default:
				debug('unknown type alias type', node.type.type)
		}

		// if (node.signatures) {
		// node.signatures.forEach(sig => {
		// // this.addReference(sig.name, join(bookDir, filePathForNameAndType('Type alias', node.name)))
		// this.processCallSignature(doc, sig, null)
		// })
		// }
	}

	private processAlias_union(doc, node) {
		debug('processAlias_union', node.name)
		debug(node.type, typeToString(node.type))

		doc.writeLine('```typescript')
		doc.writeLine(typeToString(node.type))
		doc.writeLine('```')
	}

	private processObjectLiteral(ctx, node) {
		debug('processObjectLiteral', node)
		const doc = ctx.docForKey(node.name)

		doc.writeHeading(`\`${node.name}\``)
		doc.writeComment(node.comment)
		this.processObject(doc, node.name, node.children)
		this.addReference(node.name, doc)
	}

	private processVariable(ctx, node) {
		debug('processVariable', node)
		const { name } = node

		const doc = ctx.docForKey(name)

		// 1. Create file and reference
		doc.writeSection(`\`${name}\``)
		doc.writeComment(node.comment)
		// doc.writeCodeBlock(typeToString(node.type))
	}

	private processExternalModule(ctx, node) {
		debug('processExternalModule', node)

		if (!node.children) {
			return
		}

		const modCtx = ctx.forMod(node.name)
		node.children.forEach((node) => this.processNode(modCtx, node))
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

		const methods = children.filter((node) => node.kindString === 'Method')
		if (methods.length) {
			doc.writeHeading('methods', 4)
			methods.forEach((node) => this.processClass_Method(doc, name, node))
		}

		const properties = children.filter((node) => node.kindString === 'Property')
		if (properties.length) {
			doc.writeHeading('properties', 4)
			properties.forEach((node) => this.processClass_Property(doc, name, node))
		}

		const members = children.filter((node) => node.kindString === 'Enumeration member')
		if (members.length) {
			this.processObject(doc, name, members, 'Member')
			// doc.writeTableHeader('Member', 'Default Value', 'Comment')
			// members.forEach(node => this.processMember(name, node, doc))
		}

		// console.log(children.filter(node => !['Method', 'Property'].includes(node.kindString)))
	}

	private processClass_Method(doc, parent, node) {
		if (isNodeInternal(node)) return

		node.signatures.forEach((sig) => {
			this.processCallSignature(doc, sig, parent)
			if (doc.filePath) {
				const name = `${camelcase(parent)}.${sig.name}`
				this.addReference(name, doc)
			}
		})
	}

	private processClass_Property(doc, parent, node) {
		debug('processClass_Property', parent, node.name, node)
		if (isNodeInternal(node)) return

		const { name, flags, type } = node
		let comment = commentFromNode(node)

		// comment rendered as part of an unordered list, so indent
		comment = '  ' + comment.replace(/\n/g, '  \n  ') + '  '

		doc.writeParameterLine(name, type, comment, !!flags.isOptional, node.defaultValue)
	}

	private processObject(doc, parent, members, thing = 'Name') {
		doc.writeTable([
			[thing, 'Default Value', 'Comment'],
			...members.map((node) => {
				const { name, defaultValue } = node
				const comment = commentFromNode(node)
				return [`\`${name}\``, defaultValue ? defaultValue : '', comment ? comment : '']
			}),
		])
	}

	private rewriteReadmePaths() {
		const readmeFile = join(bookDir, 'README.md')
		let readme = readFileSync(readmeFile, 'utf8')

		const linkRe = /\[([^\]]+)?\]\(([^)]+)\)/g
		readme = searchAndReplace(readme, linkRe, (text: string | null, url: string):
			| string
			| undefined => {
			if (!url.startsWith('http') && !url.startsWith('#') && !isAbsolute(url)) {
				const full = resolve(repoRoot, url)
				url = relative(bookDir, full)
				return `[${text}](./${url})`
			}
			return
		})

		writeFileSync(readmeFile, readme, 'utf8')
	}
}

function searchAndReplace(
	input: string,
	re: RegExp,
	transformer: (...matches: string[]) => string | undefined
): string {
	let match
	while ((match = re.exec(input)) !== null) {
		const [str, ...matches] = match

		const transformed = transformer(...matches)
		if (transformed !== undefined) {
			input = input.replace(str, transformed)
		}
	}
	return input
}

const externalRefs = {
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
	RegExp: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp',
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
	TypeScript: 'https://www.typescriptlang.org/',
	Flood: 'https://flood.io',
}

const docsJSON = require(__dirname + '/../../docs.json')

const parser = new DocsParser(docsJSON, puppeteerJSON)
try {
	parser.process()
} catch (err) {
	console.error(err)
}
