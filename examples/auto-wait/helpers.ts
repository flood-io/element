/**
 * A helper to get the largest order number for Step 2
 */
export const largestNumber = (numbers: (number | string)[]): number =>
	numbers
		.map(Number)
		.sort((a, b) => a - b)
		.reverse()[0]

export function expect(a: any, b: any) {
	if (a != b) throw new Error(`Expected result to be "${a}", got "${b}"`)
}
