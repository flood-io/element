export enum MessageConst {
	RUN_COMPLETED = 'completed',
	LOADED = 'loaded',
	REPORT = 'report',
}

export enum ActionConst {
	RUN = 'run',
}

export enum ChildMessages {
	INITIALIZE,
	CALL,
	END,
	PAGE_CALL_RETURN,
}

export enum ParentMessages {
	OK,
	CLIENT_ERROR,
	SETUP_ERROR,
	PAGE_CALL,
}

export type PARENT_MESSAGE_ERROR =
	| typeof ParentMessages.CLIENT_ERROR
	| typeof ParentMessages.SETUP_ERROR

export type ChildMessageInitialize = [
	typeof ChildMessages.INITIALIZE, // type
	boolean, // processed
	string, // file
	Array<unknown> | undefined, // setupArgs
	MessagePort | undefined // MessagePort
]

export type ChildMessageCall = [
	typeof ChildMessages.CALL, // type
	string, // method
	Array<unknown> // args
]

export type ChildMessageEnd = [
	typeof ChildMessages.END, // type
	boolean // processed
]

export type ChildMessage = ChildMessageInitialize | ChildMessageCall | ChildMessageEnd

export type ParentMessageOk = [
	typeof ParentMessages.OK, // type
	string, // result
	unknown[] // data
]

export type ParentMessagePageCall = [
	typeof ParentMessages.PAGE_CALL, // type
	string, // message
	unknown[] // args
]

export type ParentMessageError = [
	PARENT_MESSAGE_ERROR, // type
	string, // constructor
	string, // message
	string, // stack
	unknown // extra
]

export type ParentMessage = ParentMessageOk | ParentMessageError | ParentMessagePageCall

export interface WorkerInterface {
	send(
		request: ChildMessage,
		onProcessStart: OnStart,
		onProcessEnd: OnEnd,
		onPrecessReport?: OnReport
	): void
	waitForExit(): Promise<void>
	waitForLoaded(): Promise<void>
	forceExit(): void

	workerId: string
	workerName: string
	getStderr(): NodeJS.ReadableStream | null
	getStdout(): NodeJS.ReadableStream | null
	shutdown(): void
}

export type OnStart = (worker: WorkerInterface) => void
export type OnEnd = (err: Error | null, result: unknown, iterator: number) => void
export type OnReport = (worker: WorkerInterface, data: string[]) => void
