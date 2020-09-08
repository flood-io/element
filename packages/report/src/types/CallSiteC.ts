export interface CallSite {
	file?: string
	code?: string
	line: number
	column: number
	level?: number
}

export function callSiteToString(callSite: CallSite | undefined): string {
	if (callSite) {
		return (
			callSite.file +
			':' +
			callSite.line +
			'\n' +
			callSite.code +
			'\n' +
			new Array(callSite.column).join(' ') +
			'^'
		)
	}

	return ''
}
