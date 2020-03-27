import { Entry } from '@flood/element-api'

export function serializeResponseHeaders(entry: Entry): string {
	const { response } = entry

	if (!response) return ''
	if (!response.headers) response.headers = []

	// HTTP/1.1 200 OK\n
	const statusLine = `${response.httpVersion} ${response.statusText}`
	const headers = response.headers.map(({ name, value }) => `${name}: ${value}`)
	return [statusLine, ...headers].join('\n')
}

export function serializeRequestHeaders(entry: Entry): string {
	const { request } = entry

	if (!request.headers) request.headers = []

	const headers = request.headers.map(({ name, value }) => `${name}: ${value}`)
	return headers.join('\n')
}
