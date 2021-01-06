export type Status = 'succeed' | 'fail' | 'spinning' | 'non-spinnable' | 'stopped'

export class ReportUtils {
	private store: { id: string; alias: string; status: 'running' | 'stopped' }[] = []

	constructor(private spinnies: any) {}

	startAnimation(id: string, text: string, indent: number, status: Status = 'spinning'): void {
		const alias = `${id}_${new Date().valueOf()}`
		this.spinnies.add(alias, {
			text,
			indent,
			status,
		})
		this.store.push({ id, alias, status: 'running' })
	}

	endAnimation(
		id: string,
		text?: string,
		indent?: number,
		method: 'succeed' | 'fail' = 'succeed',
	): void {
		const report = this.store.filter(item => item.id === id && item.status === 'running')
		if (report.length) {
			this.spinnies[method](report[0].alias, { text, indent })
			report[0].status = 'stopped'
		}
	}
}
