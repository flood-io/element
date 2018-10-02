// const { red } = require('chalk')

import chalk from 'chalk'

export const error = (...messages: string[]) => {
	// let messages: string[]

	// if (typeof maybeError === 'object' && maybeError.message !== undefined) {
	// const { message } = maybeError
	// messages = [message]

	// // if (slug) {
	// // 	messages.push(`> More details: https://flood-element.com/element-cli/${slug}`)
	// // }
	// } else {
	// messages = [maybeError, ...rest]
	// }

	return chalk`{red > Error!} ${messages.join('\n')}`
}
