import { Frame } from 'playwright'

export function getFrames(childFrames: Frame[], collection?: Set<Frame>): Frame[] {
	if (typeof collection === 'undefined') collection = new Set<Frame>()

	childFrames.forEach(frame => {
		if (!collection?.has(frame)) {
			collection?.add(frame)
			getFrames(frame.childFrames(), collection)
		}
	})

	return Array.from(collection.values())
}
