import { createLogger, transports, format, Logger } from 'winston'
import { Format } from 'logform'

export default function(threadID: number, level = 'debug'): Logger {
	const formats: Format[] = [
		format.label({ label: String(threadID).padStart(2, '0') }),
		format.printf(info => `[${info.label}] ${info.level}: ${info.message}`),
	]

	return createLogger({
		level: level,
		format: format.combine(...formats),
		transports: [new transports.Console({ handleExceptions: true })],
	})
}
