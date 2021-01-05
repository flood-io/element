import { Cookie } from 'playwright'

export class ElementCookies {
	private cookies: Cookie[]

	constructor(cookies: Cookie[]) {
		this.cookies = cookies
	}

	public byUrl(url: string): ElementCookies {
		if (url) this.cookies = this.cookies.filter(cookie => cookie)
		return this
	}

	public byName(name: string): ElementCookies {
		if (name) this.cookies = this.cookies.filter(cookie => cookie.name == name)
		return this
	}
}
