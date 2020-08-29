import assert from 'assert'
import { format } from 'util'
import { Console } from 'console'
import { LogCounters, LogMessage, LogTimers, LogType } from '../types/Console'

type Formatter = (type: LogType, message: LogMessage) => string

function simpleFormatter() {
	const TITLE_INDENT = '    '
	const CONSOLE_INDENT = TITLE_INDENT + '  '

	return (type, message) => {
		message = message
			.split(/\n/)
			.map(line => CONSOLE_INDENT + line)
			.join('\n')

		return message + '\n'
	}
}
export class CustomConsole extends Console {
	private _formatBuffer: Formatter
	private _counters: LogCounters
	private _timers: LogTimers
	private _groupDepth: number
	private _stdout: NodeJS.WriteStream
	private _stderr: NodeJS.WriteStream
	private _width: number
	private _depth: number
	private _height: number

	constructor(
		stdout: NodeJS.WriteStream,
		stderr: NodeJS.WriteStream,
		formatBuffer: Formatter = (_type: LogType, message: string): string => message,
	) {
		super(stdout, stderr)
		this._stdout = stdout
		this._stderr = stderr
		this._formatBuffer = formatBuffer || simpleFormatter()
		this._counters = {}
		this._timers = {}
		this._groupDepth = 0
		if (stdout.isTTY) {
			this._width = stdout.columns!
		} else {
			this._width = 1
		}
		this._depth = 0
		this._height = 1
	}

	private _log(type, message): void {
		const logMessage = `${this._formatBuffer(type, '  '.repeat(this._groupDepth) + message)}`
		this._depth += this._height
		this._height = Math.ceil(logMessage.length / this._width)
		this._stdout.write(`${this._depth} - ${logMessage}\n`)
	}

	private _logError(type, message): void {
		const logMessage = `${this._formatBuffer(type, '  '.repeat(this._groupDepth) + message)}`
		this._depth += this._height
		this._height = Math.ceil(logMessage.length / this._width)
		this._stderr.write(`${this._depth} - ${logMessage}\n`)
	}

	assert(value: unknown, message?: string | Error): void {
		try {
			assert(value, message)
		} catch (error) {
			this._logError('assert', error.toString())
		}
	}

	count(label = 'default'): void {
		if (!this._counters[label]) {
			this._counters[label] = 0
		}

		this._log('count', format(`${label}: ${++this._counters[label]}`))
	}

	countReset(label = 'default'): void {
		this._counters[label] = 0
	}

	debug(firstArg: unknown, ...args: Array<unknown>): void {
		this._log('debug', format(firstArg, ...args))
	}
	dir(firstArg: unknown, ...args: Array<unknown>): void {
		this._log('dir', format(firstArg, ...args))
	}

	dirxml(firstArg: unknown, ...args: Array<unknown>): void {
		this._log('dirxml', format(firstArg, ...args))
	}

	error(firstArg: unknown, ...args: Array<unknown>): void {
		this._logError('error', format(firstArg, ...args))
	}

	group(title?: string, ...args: Array<unknown>): void {
		this._groupDepth++

		if (title || args.length) {
			this._log('group', format(title, ...args))
		}
	}
	groupCollapsed(title?: string, ...args: Array<unknown>): void {
		this._groupDepth++

		if (title || args.length) {
			this._log('groupCollapsed', format(title, ...args))
		}
	}

	groupEnd() {
		if (this._groupDepth > 0) {
			this._groupDepth--
		}
	}

	info(firstArg: unknown, ...args: Array<unknown>): void {
		this._log('info', format(firstArg, ...args))
	}

	log(firstArg: unknown, ...args: Array<unknown>): void {
		this._log('log', format(firstArg, ...args))
	}

	time(label = 'default'): void {
		if (this._timers[label]) {
			return
		}

		this._timers[label] = new Date()
	}

	timeEnd(label = 'default'): void {
		const startTime = this._timers[label]

		if (startTime) {
			const endTime = new Date()
			const time = endTime.getTime() - startTime.getTime()
			this._log('time', format(`${label}: ${time}ms`))
			delete this._timers[label]
		}
	}

	warn(firstArg: unknown, ...args: Array<unknown>): void {
		this._log('warn', format(firstArg, ...args))
	}

	getBuffer() {
		return null
	}
}
