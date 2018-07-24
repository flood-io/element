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

	isValid(): boolean {
		// Number.isNaN()
		return true
	}

	private _influxTags: { [name: string]: string }
	get influxTags(): { [name: string]: string } {
		if (!this._influxTags) {
			this._influxTags = this.asInfluxTags()
		}

		return this._influxTags
	}

	asInfluxTags(): { [name: string]: string } {
		let tags = {}
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
			}
		})

		return tags
	}
}
