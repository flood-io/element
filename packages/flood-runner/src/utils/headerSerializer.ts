import { Entry } from '@flood/element-api'

export function serializeResponseHeaders(entry: Entry): string {
	let { response } = entry

	if (!response) return ''
	if (!response.headers) response.headers = []

	// HTTP/1.1 200 OK\n
	let statusLine = `${response.httpVersion} ${response.statusText}`
	let headers = response.headers.map(({ name, value }) => `${name}: ${value}`)
	return [statusLine, ...headers].join('\n')
}

export function serializeRequestHeaders(entry: Entry): string {
	let { request } = entry

	if (!request.headers) request.headers = []

	let headers = request.headers.map(({ name, value }) => `${name}: ${value}`)
	return headers.join('\n')
}
