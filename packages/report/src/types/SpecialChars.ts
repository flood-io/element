const isWindows = process.platform === 'win32'

export const ARROW = ' \u203A '
export const ICONS = {
	failed: isWindows ? '\u00D7' : '\u2715',
	passes: isWindows ? '\u221A' : '\u2713',
}

export const CLEAR = isWindows ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H'
