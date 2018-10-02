import { StructuredError } from '../../utils/StructuredError'
import { PuppeteerErrorData } from './Types'

export default function interpretPuppeteerError(
	error: Error,
	target: any,
	key: string,
	callCtx: string,
): StructuredError<PuppeteerErrorData> | undefined {
	if (error.message.includes('Execution context was destroyed')) {
		return new StructuredError<PuppeteerErrorData>(
			'execution context was destroyed',
			{
				_kind: 'puppeteer',
				kind: 'execution-context-destroyed',
			},
			error,
		)
	} else if (
		error.name === 'TimeoutError' &&
		error.message.includes('waiting for function failed')
	) {
		return new StructuredError<PuppeteerErrorData>(
			'evaluation timed out',
			{
				_kind: 'puppeteer',
				kind: 'evaluation-timeout',
			},
			error,
		)
	}
}
