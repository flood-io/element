import { join, basename } from 'path'
import { writeFileSync } from 'fs'
import { spawn, execSync } from 'child_process'
import { sync as globSync } from 'glob'
import chalk from 'chalk'

process.env.DEBUG = 'element-cli:console-reporter'

// force element-cli to use the local element
const cliPkgPath = '/cli/package.json'
const elementPath = '/element'
const cliPkg = require(cliPkgPath)

cliPkg.dependencies['@flood/element'] = `file:${elementPath}/dist`
writeFileSync(cliPkgPath, JSON.stringify(cliPkg), 'utf8')

execSync('yarn build', { cwd: elementPath, stdio: 'inherit' })

console.log('yarning cli')
execSync('yarn global add file:/cli', { stdio: 'inherit' })

// run tests
console.log('running tests')

const tests = join(__dirname, 'test-scripts')
const passTests = globSync('*.pass.ts', { cwd: tests, absolute: true })
const failTests = globSync('*.fail.ts', { cwd: tests, absolute: true })
// console.log('pass', passTests)

async function runTest(testScript: string, expectPass: boolean): Promise<boolean> {
	console.log('')
	console.log(`============ running test ${basename(testScript)} ===========`)
	console.log(process.env)
	const proc = spawn('element', ['run', testScript, '--chrome'], {
		stdio: ['inherit', 'pipe', 'inherit'],
		env: process.env,
	})

	let passed = true

	proc.stdout.setEncoding('utf8')

	for await (const data of proc.stdout) {
		process.stdout.write(data)
		if (/xxxx Step .* failed/.test(data)) {
			passed = false
		}
	}

	if (expectPass !== passed) {
		console.error(
			chalk`{red error}: test script expected to {blue ${
				expectPass ? 'pass' : 'fail'
			}} but instead {red ${passed ? 'passed' : 'failed'}}`,
		)
	}

	return expectPass === passed
}

async function runAll() {
	let allExpected = true
	passTests
	// for (const test of passTests) {
	// allExpected = (await runTest(test, true)) && allExpected
	// }
	for (const test of failTests) {
		allExpected = (await runTest(test, false)) && allExpected
	}

	console.log()
	if (allExpected) {
		console.log(chalk`{green all scripts ran as expected}`)
	} else {
		console.log(chalk`{red not all scripts ran as expected}`)
	}
}

runAll()
