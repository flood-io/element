// import * as recast from 'recast'
import ts from 'typescript'
import { readFileSync } from 'fs'
const debug = require('debug')('element:docs')

export function preParseIndex(fileName: string) {
	const ctx = {
		indexMap: {} as { [key: string]: string },
		indexExports: {} as { [key: string]: string },
	}

	const s = ts.createSourceFile(
		fileName,
		readFileSync(fileName, 'utf8'),
		ts.ScriptTarget.ES2015,
		/* setParentNodes */ true,
	)
	ts.forEachChild(s, node => {
		switch (node.kind) {
			case ts.SyntaxKind.ExportDeclaration:
				getExport(ctx, node)
				break
			case ts.SyntaxKind.VariableStatement:
				getVariableExport(ctx, node)
				break
			default:
				debug('unhandled sk', ts.SyntaxKind[node.kind])
			// debug('unhandled', node)
		}
	})

	return ctx
}

type tags = { [key: string]: any }

function getDocTags(node): tags {
	const t: tags = {}

	const jsDocs = node.jsDoc && node.jsDoc[0] && node.jsDoc[0].tags

	if (!jsDocs) return {}

	for (const jtag of jsDocs) {
		t[jtag.tagName.escapedText] = jtag.comment
	}

	if (t['docAlias']) {
		t['docAlias'] = t['docAlias'].split(/\s+/, 2)
	}

	// if (tag.tagName.escapedText === 'docPage') {
	// return tag.comment
	// }
	return t
}

function addIndex(ctx, name, srcFile, docTags) {
	if (name === undefined) return
	const { docPage } = docTags
	if (docPage === undefined) return

	debug('alias', docTags.docAlias)

	ctx.indexMap[`${srcFile}.${name}`] = docPage
	ctx.indexExports[name] = docPage
	if (docTags.docAlias && docTags.docAlias[0] === name) {
		const aliasName = docTags.docAlias[1]
		ctx.indexMap[`${srcFile}.${aliasName}`] = docPage
		ctx.indexExports[aliasName] = docPage
	}
}

function getExport(ctx, node) {
	const docTags = getDocTags(node)
	debug(docTags)

	let srcFile = node.moduleSpecifier.text
	if (srcFile.startsWith('./')) srcFile = srcFile.slice(2)

	// if (!indexMap[srcFile]) indexMap[srcFile] = []

	node.exportClause.elements.forEach(exportDef => {
		const name = exportDef.name.escapedText
		addIndex(ctx, name, srcFile, docTags)
	})
}

function getVariableExport(ctx, node) {
	const docTags = getDocTags(node)

	node.declarationList.declarations.forEach(decl => {
		const name = decl.name.escapedText
		if (name === undefined) return

		addIndex(ctx, name, 'index', docTags)
	})
}
