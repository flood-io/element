const { writeFileSync } = require('fs')
const { execSync } = require('child_process')
const { join } = require('path')

// force element-cli to use the local element
const elementPath = '/element/packages/element'
const cliPath = '/element/packages/cli'

const cliPkgPath = join(cliPath, 'package.json')
const cliPkg = require(cliPkgPath)

execSync('yarn build', { cwd: elementPath, stdio: 'inherit' })

cliPkg.dependencies['@flood/element'] = `file:${elementPath}/dist`
writeFileSync(cliPkgPath, JSON.stringify(cliPkg), 'utf8')

execSync('yarn build', { cwd: cliPath, stdio: 'inherit' })

console.log('yarning cli')
execSync(`yarn global add file:${cliPath}`, { stdio: 'inherit' })
