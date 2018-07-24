import { createLogger, transports, format, Logger } from 'winston'
import { Format } from 'logform'
import * as strftime from 'strftime'

export default function(
	level: string = 'debug',
	colourise: boolean = false,
	prefix: string = '1',
): Logger {
	let formats: Format[] = [
		format.label({ label: prefix.padStart(2, '0') }),
		format.timestamp({ format: () => strftime('%Y-%m-%d %T,%L', new Date()) }),
	]

	if (colourise) {
		formats.push(format.colorize())
	}

	formats.push(
		format.printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`),
	)

	return createLogger({
		level: level,
		format: format.combine(...formats),
		transports: [new transports.Console({ handleExceptions: true })],
		// handleExceptions: true
	})
}
