export type Point = [number, number]

export const isPoint = (thing: any): thing is Point => {
	return Array.isArray(thing) && thing.every(el => typeof el === 'number') && thing.length == 2
}
