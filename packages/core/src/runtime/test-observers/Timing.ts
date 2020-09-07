import { expect } from '@flood/element-report'

type TimingRec = { start: number; end: number; thinkTime: number }
type TimingSegmentName = 'beforeStep' | 'step' | 'afterStep'

export class Timing {
	private segments: Map<TimingSegmentName, TimingRec>
	constructor(public epoch: Date = new Date()) {
		this.segments = new Map()
	}

	start(segmentName: TimingSegmentName) {
		const now = new Date().valueOf()
		this.segments.set(segmentName, { start: now, end: 0, thinkTime: 0 })
	}

	end(segmentName: TimingSegmentName) {
		const seg = expect(this.segments.get(segmentName), `No timing started for ${segmentName}`)
		const now = new Date().valueOf()
		seg.end = now
		this.segments.set(segmentName, seg)
	}
	// TODO thinkTime

	getDurationForSegment(segmentName: TimingSegmentName): number {
		const { start, end } = expect(
			this.segments.get(segmentName),
			`No timing started for ${segmentName}`,
		)
		return end - start
	}

	getThinkTimeForSegment(segmentName: TimingSegmentName): number {
		const { thinkTime } = expect(
			this.segments.get(segmentName),
			`No timing started for ${segmentName}`,
		)
		return thinkTime
	}

	getDurationWithoutThinkTimeForSegment(segmentName: TimingSegmentName): number {
		return this.getDurationForSegment(segmentName) - this.getThinkTimeForSegment(segmentName)
	}

	async measureThinkTime(segmentName: TimingSegmentName, func: Function, ...args: any[]) {
		const seg = expect(this.segments.get(segmentName), `No timing started for ${segmentName}`)
		const start = new Date()
		await func.apply(this, ...args)
		const end = new Date()
		seg.thinkTime += end.valueOf() - start.valueOf()
	}

	reset() {
		this.segments.clear()
	}
}
