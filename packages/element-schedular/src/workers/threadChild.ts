import { parentPort } from 'worker_threads'
import {
	ChildMessages,
	ChildMessage,
	ChildMessageCall,
	// ChildMessageInitialize,
	// ChildMessageCall,
	// ParentMessages,
	// PARENT_MESSAGE_ERROR,
} from '../types'

async function execMethod(method: string, args: Array<any>) {
	switch (method) {
		case 'connect': {
			const { connectWS } = await import('@flood/element-core')
			console.log(connectWS)
			const [url, script] = args as [string, string]

			console.log(url, script.slice(0, 100))

			const client = await connectWS(url)

			await client.page.goto('https://flood.io')
			break
		}
	}
}

const messageListener = async (request: ChildMessage) => {
	// console.log(`[Worker]`, request)

	const [type] = request

	switch (type) {
		case ChildMessages.INITIALIZE: {
			console.log('Init done')
			break
		}

		case ChildMessages.CALL: {
			const call = request as ChildMessageCall
			await execMethod(call[1], call[2]).catch(err => console.log(err.message))
			break
		}

		case ChildMessages.END: {
			// eslint-disable-next-line @typescript-eslint/no-use-before-define
			end()
			break
		}

		default:
			throw new TypeError('Unexpected request from parent process: ' + request[0])
	}
}

function exitProcess(): void {
	// Clean up open handles so the worker ideally exits gracefully
	if (parentPort) parentPort.removeListener('message', messageListener)
}

function end(): void {
	exitProcess()
}

if (parentPort) parentPort.on('message', messageListener)

// const proxy: (...args: any[]) => void = new Proxy<() => void>(
// 	function() {
// 		return
// 	},
// 	{
// 		apply: (target, that, args) => {
// 			const [method, ...rest] = args
// 			return callPageMethod(method, rest)
// 		},
// 	},
// )

// // class PageProxy {
// // 	goto = proxy
// // }

// export function callPageMethod(method: keyof Page, ...args: any[]) {
// 	if (parentPort) parentPort.postMessage([ParentMessages.PAGE_CALL, method, args])
// }

// function reportInitializeError(error: Error) {
// 	return reportError(error, ParentMessages.SETUP_ERROR)
// }

// function reportError(error: Error, type: PARENT_MESSAGE_ERROR) {
// 	if (isMainThread) {
// 		throw new Error('Child can only be used on a forked process')
// 	}

// 	if (error == null) {
// 		error = new Error('"null" or "undefined" thrown')
// 	}

// 	if (parentPort)
// 		parentPort.postMessage([
// 			type,
// 			error.constructor && error.constructor.name,
// 			error.message,
// 			error.stack,
// 			typeof error === 'object' ? { ...error } : error,
// 		])
// }

// function execFunction(
// 	fn: (...args: Array<unknown>) => any,
// 	ctx: unknown,
// 	args: Array<unknown>,
// 	onResult: (result: unknown) => void,
// 	onError: (error: Error) => void,
// ): void {
// 	let result

// 	try {
// 		result = fn.apply(ctx, args)
// 	} catch (err) {
// 		onError(err)

// 		return
// 	}

// 	if (result && typeof result.then === 'function') {
// 		result.then(onResult, onError)
// 	} else {
// 		onResult(result)
// 	}
// }
