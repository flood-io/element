import InfluxReporter from './InfluxReporter'
import { Logger } from 'winston'
import ms from 'ms'
const tickerInterval = ms('15s')

export async function startConcurrencyTicker(influxReporter: InfluxReporter, logger: Logger) {
	logger.debug('ticking concurrency')
	await influxReporter.sendConcurrencyPoint()
	setTimeout(async () => await startConcurrencyTicker(influxReporter, logger), tickerInterval)
}
