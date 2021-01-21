declare module 'spinnies' {
	type StopAllStatus = 'succeed' | 'fail' | 'stopped'
	type SpinnerStatus = StopAllStatus | 'spinning' | 'non-spinnable'

	interface Spinner {
		interval: number
		frames: string[]
	}

	interface SpinnerOptions {
		text?: string
		indent?: number
		status?: SpinnerStatus
		color?: string
		succeedColor?: string
		failColor?: string
	}

	interface Options {
		color?: string
		succeedColor?: string
		failColor?: string
		spinnerColor?: string
		succeedPrefix?: string
		failPrefix?: string
		disableSpins?: boolean
		spinner?: Spinner
	}

	export default class Spinnies {
		static dots: Spinner
		static dashes: Spinner
		constructor(options?: Options)
		add: (name: string, options?: SpinnerOptions) => SpinnerOptions
		pick: (name: string) => SpinnerOptions
		remove: (name: string) => SpinnerOptions
		update: (name: string, options?: SpinnerOptions) => SpinnerOptions
		succeed: (name: string, options?: SpinnerOptions) => SpinnerOptions
		fail: (name: string, options?: SpinnerOptions) => SpinnerOptions
		stopAll: (status?: StopAllStatus) => { [name: string]: SpinnerOptions }
		hasActiveSpinners: () => boolean
	}
}
