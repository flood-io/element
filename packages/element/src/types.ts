import { Browser, Page, LaunchOptions } from 'puppeteer'
import { FloodProcessEnv } from '../index'

export interface PuppeteerClient {
	browser: Browser
	page: Page
}

export interface RuntimeEnvironment {
	stepEnv(): FloodProcessEnv
	workRoot: WorkRoot
}

export type SpecialSubRoot = 'test-data'
export type SubRoot = 'objects' | 'screenshots' | 'files' | 'results' | 'network' | 'traces'
export type WorkRootKind = SubRoot | SpecialSubRoot
export interface WorkRoot {
	ensureCreated(): void

	join(kind: WorkRootKind, ...segments: string[]): string
}

export interface Browser {
	launch(options?: LaunchOptions): Promise<PuppeteerClient>
	client(): Promise<PuppeteerClient>
	close(): Promise<void>
}

export interface ITestRunner {
	run(testScript: Object): Promise<void>
	shutdown(): Promise<void>
}

export type Action = {
	type: string
	input?: string | string[]
	arguments?: Array<string | Action | Symbol>
	test?: Action
	consequent?: Action[]
	alternate?: Action[]
}
