// const { red } = require('chalk')

import chalk from 'chalk'

export const error = (...input) => {
	let messages = input

	if (typeof input[0] === 'object') {
		const { message } = input[0]
		messages = [message]

		// if (slug) {
		// 	messages.push(`> More details: https://flood-element.com/element-cli/${slug}`)
		// }
	}

	return `${chalk.red('> Error!')} ${messages.join('\n')}`
}
