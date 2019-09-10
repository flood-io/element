import { createLogger, transports, format, Logger } from 'winston'
import { Format } from 'logform'

export default function(level: string = 'debug', colourise: boolean = false): Logger {
	const startTime = Date.now()
	let formats: Format[] = [
		// format.label({ label: prefix.padStart(2, '0') }),
		format.timestamp({ format: () => `+${Math.floor((Date.now() - startTime) / 1000)}s` }),
	]

	if (colourise) {
		formats.push(format.colorize())
	}

	formats.push(format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`))

	return createLogger({
		level: level,
		format: format.combine(...formats),
		transports: [new transports.Console({ handleExceptions: true })],
		// handleExceptions: true
	})
}
