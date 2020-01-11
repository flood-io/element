export function withDefault<T>(value: T | undefined, defaultValue: T): T {
	if (typeof value === 'undefined') return defaultValue
	return value
}
