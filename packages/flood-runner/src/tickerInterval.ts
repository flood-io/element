import InfluxReporter from './InfluxReporter'
import { Logger } from 'winston'
const tickerInterval = 15000

export async function startConcurrencyTicker(
	influxReporter: InfluxReporter,
	logger: Logger,
): Promise<void> {
	logger.debug('ticking concurrency')
	await influxReporter.sendConcurrencyPoint()
	setTimeout(async () => await startConcurrencyTicker(influxReporter, logger), tickerInterval)
}
