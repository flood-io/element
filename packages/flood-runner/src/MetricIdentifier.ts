export function newMetricIdentifierFromObject(obj: any): MetricIdentifier {
	return new MetricIdentifier(
		obj.accountID,
		obj.floodID,
		obj.gridID,
		obj.nodeID,
		obj.projectID,
		obj.region,
	)
}

export default class MetricIdentifier {
	constructor(
		public accountID: number,
		public floodID: number,
		public gridID: number,
		public nodeID: number,
		public projectID: number,
		public region: string,
	) {}

	get isValid(): boolean {
		this.influxTags
		// Number.isNaN()
		return true
	}

	get invalidReason(): string {
		return ''
	}

	private _influxTags: { [name: string]: string }
	get influxTags(): { [name: string]: string } {
		if (!this._influxTags) {
			this._influxTags = this.asInfluxTags()
		}

		return this._influxTags
	}

	asInfluxTags(): { [name: string]: string } {
		const tags: { [name: string]: string } = {}
		const pairs = [
			['account', this.accountID],
			['flood', this.floodID],
			['account', this.accountID],
			['project', this.projectID],
			['grid', this.gridID],
			['node', this.nodeID],
			['region', this.region],
		]

		pairs.forEach(([key, value]) => {
			if (typeof value === 'string') {
				tags[key] = value
			} else if (typeof value === 'number' && !Number.isNaN(value)) {
				tags[key] = String(value)
			} else {
				throw new Error(`tag '${key}' value '${value}' invalid`)
			}
		})

		return tags
	}
}
