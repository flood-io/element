import { Logger, transports } from 'winston'
import * as strftime from 'strftime'

export default class FloodLogger extends Logger {
	constructor(prefix = process.env.THREAD_ID || '1') {
		let transport = new transports.Console({
			level: process.env.LOG_LEVEL || 'debug',
			colorize: !process.env.THREAD_ID,
			label: prefix.padStart(2, '0'),
			timestamp() {
				return strftime('%Y-%m-%d %T,%L', new Date())
			},
		})

		super({ transports: [transport], handleExceptions: true })
	}
}
