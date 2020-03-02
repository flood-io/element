export function assertConfigString(value: string | null | undefined, err: string): void | never {
	if (value === null || value === undefined || value === '') throw new Error(err)
}

export function assertConfig(value: any | null | undefined, err: string): void | never {
	if (value === null || value === undefined) throw new Error(err)
}
