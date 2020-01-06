export function generateAnchor(name: string): string {
	return name
		.toLowerCase()
		.replace(/\s+/gi, '-')
		.replace(/[^a-z0-9-_]/gi, '')
}
