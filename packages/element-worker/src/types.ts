// import { TestSettings } from '@flood/element-core'
import mergeStream from 'merge-stream'
import { WorkerOptions } from './worker/ElementWorker'
import { EventEmitter } from 'events'

/**
 * Represents messages sent from the parent tot he child
 */
export enum Instruction {
	INIT,
	CALL,
	CONNECT,
	DISCONNECT,
	START,
	STOP,
	END,
}

/**
 * Represents messages sent from the child to the parent
 */
export enum Reply {
	OK,
	ERROR,
	EVENT,
}

export type InstructionPayload =
	| InitInstruction
	| CallInstruction
	| ConnectInstruction
	| StartInstruction
	| StopInstruction
	| EndInstruction

export type InitInstruction = {
	type: Instruction.INIT
	workerId: number
}

export type CallInstruction = {
	type: Instruction.CALL
	method: string
	args: unknown[]
}

export type ConnectInstruction = {
	type: Instruction.CONNECT
	options: WorkerOptions
}

export type StartInstruction = {
	type: Instruction.START
}

export type StopInstruction = {
	type: Instruction.STOP
}

export type EndInstruction = {
	type: Instruction.END
}

export type MessageReply = [
	Reply, // type
]

export type ReplyError = MessageReply &
	[
		typeof Reply.ERROR,
		string, // constructor
		string, // message
		string, // stack
	]

export type ReplyOk = MessageReply & [typeof Reply.OK, unknown]

export enum Messages {
	INIT,
	ERROR,
	REPLY,
	CLOSE,
}

export type MessagePayload = [Instruction, unknown?]
export type ReplyPayload<T = unknown> = [Reply, T?] | MessageEvent

export type MessageEvent = [
	// Event name
	string,
	// Event payload
	unknown,
]

export type ChildMessage = {
	type: Instruction
	timestamp?: Date
}

// export type ChildMessageInit = ChildMessage & {
// 	file: string
// 	setupArgs: unknown[]
// }

// export type ChildMessageConnect = ChildMessage & {
// 	data: WorkerOptions
// }

// export type ChildMessageStart = ChildMessage & {
// 	testScriptContent: string
// 	settings: TestSettings
// }

// export type ParentMessage = {
// 	type: Reply
// }

export type MessagePort = EventEmitter & {
	postMessage(message: unknown): void
}

export type MessageError<T = unknown> = [
	Messages.ERROR, // type
	string, // constructor
	string, // message
	string, // stack
	T, // extra
]

export type WorkerMessage = MessageError | MessageReply | MessageEvent

export type MergeStream = ReturnType<typeof mergeStream>

export interface WorkerInterface {
	send<RT = any>(inst: Instruction, data: unknown): Promise<RT>
	// send(request: ChildMessage, onProcessStart: OnStart, onProcessEnd: OnEnd): void
	waitForExit(): Promise<void>
	forceExit(): void

	workerId: number
	stderr: NodeJS.ReadableStream | MergeStream | null
	stdout: NodeJS.ReadableStream | MergeStream | null
}

export type OnStart = (worker: WorkerInterface) => void
export type OnEnd = (err: Error | null, result: unknown) => void

export interface WorkerData {
	cwd: string
	env: NodeJS.ProcessEnv
}
