// eslint-disable-next-line no-undef
module.exports = {
	options: {
		headless: true,
		devtools: false,
		sandbox: true,
		watch: false,
		stepDelay: 0,
		actionDelay: 0,
		loopCount: 2,
		strict: false,
		failStatusCode: 1,
		verbose: false,
	},
	paths: {
		workRoot: '.',
		testDataRoot: '.',
		testPathMatch: ['./examples/flood-challenge.ts', './examples/youtube.ts'],
	},
	flood: {
		hosted: false,
		vu: 500,
		duration: 15,
		rampup: 0,
		regions: [''],
	},
}
