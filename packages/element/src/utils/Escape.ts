/**
 * Escapes a CSS string.
 * @param {string} css the string to escape.
 * @return {string} the escaped string.
 * @throws {TypeError} if the input value is not a string.
 * @throws {InvalidCharacterError} if the string contains an invalid character.
 * @see https://drafts.csswg.org/cssom/#serialize-an-identifier
 */
export function escapeCss(css: string): string {
	let ret = ''
	const n = css.length
	for (let i = 0; i < n; i++) {
		const c = css.charCodeAt(i)
		if (c == 0x0) {
			throw new Error('Invalid Chr')
		}

		if (
			(c >= 0x0001 && c <= 0x001f) ||
			c == 0x007f ||
			(i == 0 && c >= 0x0030 && c <= 0x0039) ||
			(i == 1 && c >= 0x0030 && c <= 0x0039 && css.charCodeAt(0) == 0x002d)
		) {
			ret += '\\' + c.toString(16) + ' '
			continue
		}

		if (i == 0 && c == 0x002d && n == 1) {
			ret += '\\' + css.charAt(i)
			continue
		}

		if (
			c >= 0x0080 ||
			c == 0x002d || // -
			c == 0x005f || // _
			(c >= 0x0030 && c <= 0x0039) || // [0-9]
			(c >= 0x0041 && c <= 0x005a) || // [A-Z]
			(c >= 0x0061 && c <= 0x007a)
		) {
			// [a-z]
			ret += css.charAt(i)
			continue
		}

		ret += '\\' + css.charAt(i)
	}
	return ret
}
