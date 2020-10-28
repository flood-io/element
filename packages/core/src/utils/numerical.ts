export function getNumberWithOrdinal(number: number) {
	const suffix = ['th', 'st', 'nd', 'rd'],
		remainder = number % 100
	return number + (suffix[(remainder - 20) % 10] || suffix[remainder] || suffix[0])
}
