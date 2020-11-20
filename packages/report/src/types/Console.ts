export type LogMessage = string

export type LogCounters = {
	[label: string]: number
}

export type LogTimers = {
	[label: string]: Date
}

export type LogType =
	| 'assert'
	| 'count'
	| 'debug'
	| 'dir'
	| 'dirxml'
	| 'error'
	| 'group'
	| 'groupCollapsed'
	| 'info'
	| 'log'
	| 'time'
	| 'warn'
