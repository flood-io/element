// eslint-disable-next-line no-undef
module.exports = {
	options: {
		headless: true,
		devtools: false,
		sandbox: true,
		watch: false,
		stepDelay: '0s',
		actionDelay: '0s',
		loopCount: 1,
		strict: false,
		failStatusCode: 1,
		verbose: false,
	},
	paths: {
		workRoot: '.',
		testDataRoot: '.',
		testPathMatch: ['./*.perf*.ts'],
	},
	flood: {
		hosted: false,
		vu: 500,
		duration: 15,
		rampup: 0,
		regions: [''],
	},
}
