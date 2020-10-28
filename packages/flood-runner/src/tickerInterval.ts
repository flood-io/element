import InfluxReporter from './InfluxReporter'
const tickerInterval = 15000


export async function startConcurrencyTicker(influxReporter: InfluxReporter) {
	await influxReporter.sendConcurrencyPoint()
	setTimeout(async () => await startConcurrencyTicker(influxReporter), tickerInterval)
}
