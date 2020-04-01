import InfluxReporter from './InfluxReporter'
import { Logger } from 'winston'
const tickerInterval = 15 * 1e3

export async function startConcurrencyTicker(influxReporter: InfluxReporter, logger: Logger) {
	logger.debug('ticking concurrency')
	await influxReporter.sendConcurrencyPoint()
	setTimeout(async () => await startConcurrencyTicker(influxReporter, logger), tickerInterval)
}
