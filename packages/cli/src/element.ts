import * as argv from 'yargs'
import chalk from 'chalk'
import { join } from 'path'
const debug = require('debug')('element:main')
import { error } from './utils/out/error'
// import { info } from './utils/out/info'
// import { existsSync } from 'fs'
// import { resolve } from 'path'
// import * as checkForUpdate from 'update-check'
// import * as ms from 'ms'

// const pkg = (() => {
// let paths = ['../../package.json', '../package.json']

// let pkgPath = paths.map(p => resolve(p)).find(p => {
// try {
// return existsSync(p)
// } catch {
// return false
// }
// })
// return require(pkgPath)
// })()

const cmdRoot = join(__dirname, 'cmd')

export const handleUnexpected = err => {
	debug('handling unexpected error')

	console.error(error(`An unexpected error occurred!\n  ${err.stack} ${err.stack}`))

	process.exit(1)
}

const handleRejection = err => {
	debug('handling rejection')

	if (err) {
		if (err instanceof Error) {
			handleUnexpected(err)
		} else {
			console.error(error(`An unexpected rejection occurred\n  ${err}`))
		}
	} else {
		console.error(error('An unexpected empty rejection occurred'))
	}

	process.exit(1)
}

process.on('unhandledRejection', handleRejection)
process.on('uncaughtException', handleUnexpected)

export async function main() {
	// const { isTTY } = process.stdout
	// let update = null

	// try {
	// update = await checkForUpdate(pkg, {
	// interval: ms('1d'),
	// distTag: pkg.version.includes('canary') ? 'canary' : 'latest',
	// })
	// } catch (err) {
	// console.error(error(`Checking for updates failed`))
	// console.error(err)
	// }

	// if (update && isTTY) {
	// console.log(
	// info(
	// `${chalk.bgRed('UPDATE AVAILABLE')} The latest version of Element CLI is ${update &&
	// update.latest}`,
	// ),
	// )
	// console.log(info(`Get it by running ${chalk.greenBright('yarn add @flood/cli@latest')}`))
	// }

	return argv
		.usage(`${chalk.bold(chalk.blueBright('element'))} subcommand [options]`)
		.commandDir(cmdRoot, {
			extensions: ['js', 'ts'],
		})
		.demandCommand()
		.help('help')
		.updateStrings({
			'Commands:': chalk.grey('Commands:\n'),
			'Options:': chalk.grey('Options:\n'),
		})
		.version('1.0') // (pkg.version)
		.showHelpOnFail(true)
		.recommendCommands()
		.example(
			'$0 run -f ./examples/flood-challenge.ts',
			'Run the Flood Challenge example script in your local browser',
		)
		.epilogue(`For more information on Flood Element, see https://element.flood.io`).argv
}
