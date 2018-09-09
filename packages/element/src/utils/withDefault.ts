export function withDefault<T>(value: T | undefined, defaultValue: T): T {
	if (value === undefined) {
		return defaultValue
	} else {
		return value
	}
}
