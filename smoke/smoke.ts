import { join, basename } from 'path'
import { writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { sync as globSync } from 'glob'

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

function runTest(testScript: string, expectPass: boolean) {
	console.log('')
	console.log(`============ running test ${basename(testScript)} ===========`)
	execSync(`element run ${testScript} --chrome`, { stdio: 'inherit' })
}

passTests.forEach(test => runTest(test, true))
failTests.forEach(test => runTest(test, false))
