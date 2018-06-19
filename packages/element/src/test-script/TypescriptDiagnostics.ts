import { Diagnostic, DiagnosticCategory } from 'typescript'
import * as ts from 'typescript'

// because https://github.com/Microsoft/TypeScript/issues/13042
type diagnosticCategory = 'warnings' | 'errors' | 'messages'

function categoryMap(d: DiagnosticCategory): diagnosticCategory {
	switch (d) {
		case DiagnosticCategory.Error:
			return 'errors'
		case DiagnosticCategory.Warning:
			return 'warnings'
		case DiagnosticCategory.Message:
			return 'messages'
	}
}

type FilenameMapper = (from: string) => string

export class CategorisedDiagnostics {
	diagnostics: { [DKey in diagnosticCategory]: Diagnostic[] }

	constructor(
		private formatHost: ts.FormatDiagnosticsHost,
		private filenameMapper: FilenameMapper,
	) {
		this.diagnostics = { errors: [], warnings: [], messages: [] }
	}

	has(kind: diagnosticCategory): boolean {
		return this.forCategory(kind).length > 0
	}

	hasNonErrors(): boolean {
		return this.has('messages') || this.has('warnings')
	}

	hasOnlyNonErrors(): boolean {
		return !this.has('errors') && this.hasNonErrors()
	}

	add(d: Diagnostic): void {
		this.forCategory(categoryMap(d.category)).push(d)
	}

	forCategory(kind: diagnosticCategory): Diagnostic[] {
		return this.diagnostics[kind]
	}

	formattedForCategory(kind: diagnosticCategory): string {
		const diagnostics = this.forCategory(kind).map(d => {
			if (d.file) {
				d.file.fileName = this.filenameMapper(d.file.fileName)
			}
			return d
		})

		return ts.formatDiagnosticsWithColorAndContext(diagnostics, this.formatHost)
	}

	stringForCategory(kind: diagnosticCategory, delim = '\n'): string {
		return this.format(kind).join(delim)
	}

	format(kind: diagnosticCategory): string[] {
		return this.forCategory(kind).map(d => this.formatDiagnostic(d))
	}

	formatDiagnostic(diagnostic: Diagnostic): string {
		if (diagnostic.file) {
			const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start!)
			const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
			return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`
		} else {
			return `${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
		}
	}
}
