export class CompilerStats {
	hash?: string
	startTime?: number
	endTime?: number
	/** Returns true if there were errors while compiling. */
	hasErrors(): boolean {
		return false
	}
	/** Returns true if there were warnings while compiling. */
	hasWarnings(): boolean {
		return false
	}
	/** Returns a formatted string of the compilation information (similar to CLI output). */
	toString(/* options?: Stats.ToStringOptions */): string {
		return 'Compiled'
	}
}
