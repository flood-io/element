import { createLogger, transports, format, Logger } from 'winston'
import { Format } from 'logform'

export default function(threadID: number, level: string = 'debug'): Logger {
	let formats: Format[] = [
		format.label({ label: String(threadID).padStart(2, '0') }),
		format.printf(info => `[${info.label}] ${info.level}: ${info.message}`),
	]

	return createLogger({
		level: level,
		format: format.combine(...formats),
		transports: [new transports.Console({ handleExceptions: true })],
	})
}
