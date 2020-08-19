export type DefaultLevel = '   '
export interface Callsite {
	file?: string
	code?: string
	line: number
	column: number
	level?: number
}

export function callsiteToString(callsite: Callsite | undefined): string {
	if (callsite) {
		return (
			callsite.file +
			':' +
			callsite.line +
			'\n' +
			callsite.code +
			'\n' +
			new Array(callsite.column).join(' ') +
			'^'
		)
	}

	return ''
}
