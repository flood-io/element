import assert from 'assert'
import { format } from 'util'
import { Console } from 'console'
import { LogCounters, LogTimers, LogType } from '../types/Console'
import Spinnies from 'spinnies'

export class CustomConsole extends Console {
	private _counters: LogCounters
	private _timers: LogTimers
	private _groupDepth: number
	private _spinnies: any

	constructor(stdout: NodeJS.WriteStream, stderr: NodeJS.WriteStream, spinnies: Spinnies) {
		super(stdout, stderr)
		this._counters = {}
		this._timers = {}
		this._groupDepth = 0
		this._spinnies = spinnies
	}

	private _log(type: LogType, message: string): void {
		this._spinnies.add(`${message}_${new Date().valueOf()}`, {
			text: message,
			status: 'non-spinnable',
			indent: this._groupDepth,
		})
	}

	private _logError(type: LogType, message: string): void {
		this._spinnies.add(`${message}_${new Date().valueOf()}`, {
			text: message,
			status: 'non-spinnable',
			indent: this._groupDepth,
		})
	}

	setGroupDepth(groupDepth: number): void {
		this._groupDepth = groupDepth
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
		if (title || args.length) {
			this._log('group', format(title, ...args))
		}

		this._groupDepth += 2
	}
	groupCollapsed(title?: string, ...args: Array<unknown>): void {
		this._groupDepth++

		if (title || args.length) {
			this._log('groupCollapsed', format(title, ...args))
		}
	}

	groupEnd(): void {
		if (this._groupDepth > 0) {
			this._groupDepth -= 2
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

	getBuffer(): null {
		return null
	}
}
