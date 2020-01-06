export async function initErrorString(tag: string, id: string, foundVia?: string): Promise<string> {
	if (tag == null) tag = 'element-tag'
	let estr = `<${tag.toLowerCase()}`
	if (id != null) {
		estr += ` id='#${id}'`
	}

	if (foundVia !== null) {
		estr += ` found using '${foundVia}'`
	}

	estr += '>'
	return estr
}
