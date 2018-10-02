export type Opaque = {} | void | null | undefined
export type Factory<T> = (...args: Opaque[]) => T
export type AsyncFactory<T> = (...args: Opaque[]) => Promise<T>
