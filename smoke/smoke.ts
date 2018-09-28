import { join, basename } from 'path'
import { spawn } from 'child_process'
import { sync as globSync } from 'glob'
import chalk from 'chalk'

process.env.DEBUG = 'element-cli:console-reporter'

// run tests
console.log('running tests')

const tests = join(__dirname, 'test-scripts')
let passTests = globSync('*.pass.ts', { cwd: tests, absolute: true })
let failTests = globSync('*.fail.ts', { cwd: tests, absolute: true })
// console.log('pass', passTests)

async function runTest(testScript: string, expectPass: boolean): Promise<boolean> {
	const shortName = basename(testScript)
	const shortBareName = basename(testScript, '.ts')

	const dataDir = join(tests, shortBareName)

	console.log('')
	console.log(chalk`{yellow ============ {magenta running test {blue ${shortName}}} ===========}`)
	// console.log(process.env)
	const proc = spawn(
		'element',
		['run', testScript, '--chrome', '--verbose', '--test-data-root', dataDir],
		{
			stdio: ['inherit', 'pipe', 'inherit'],
			env: process.env,
		},
	)

	let passed = true

	proc.stdout.setEncoding('utf8')

	for await (const data of proc.stdout) {
		process.stdout.write(data)
		if (detectError(data)) {
			passed = false
		}
	}

	if (expectPass === passed) {
		console.info(chalk`{green test script {blue ${shortName}} ran as expected}`)
	} else if (expectPass !== passed) {
		console.error(chalk`{red test script {blue ${shortName}} did not run as expected}`)
		console.error(
			chalk`expected to {blue ${expectPass ? 'pass' : 'fail'}} but instead {red ${
				passed ? 'passed' : 'failed'
			}}`,
		)
	}

	return expectPass === passed
}

function detectError(data: string): boolean {
	return (
		/xxxx Step .* failed/.test(data) ||
		/internal flood-chrome error/.test(data) ||
		/unable to compile script/.test(data)
	)
}

async function runAll(): Promise<number> {
	// DEBUG filter
	// passTests = passTests.filter(x => /googling/.test(x))
	// failTests = []

	const unexpected: { test: string; expectPass: boolean }[] = []

	for (const test of passTests) {
		if (!(await runTest(test, true))) {
			unexpected.push({ test, expectPass: true })
		}
	}
	for (const test of failTests) {
		if (!(await runTest(test, false))) {
			unexpected.push({ test, expectPass: false })
		}
	}

	console.log()
	if (unexpected.length > 0) {
		console.log(chalk`{red not all scripts ran as expected}`)
		for (const { test, expectPass } of unexpected) {
			const resultDesc = expectPass ? 'expected to pass, but failed' : 'expected to fail but passed'
			console.log(chalk`- {red ${basename(test)}} ${resultDesc}`)
		}
		return 1
	} else {
		console.log(chalk`{green all scripts ran as expected}`)
		return 0
	}
}

runAll()
	.then(code => process.exit(code))
	.catch(() => process.exit(1))
