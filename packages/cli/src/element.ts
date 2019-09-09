import * as argv from 'yargs'
import chalk from 'chalk'
import { error } from './utils/error'
import { updateCheck } from './utils/updateCheck'
import { join } from 'path'
import initCmd from './cmd/init'
import runCmd from './cmd/run'
import planCmd from './cmd/plan'
import generateCmd from './cmd/generate'

const debug = require('debug')('element:cli')

export const handleUnexpected = (err: Error) => {
	debug('handling unexpected error')

	console.error(error(`An unexpected error occurred!\n  ${err.stack} ${err.stack}`))
	console.error(
		'this is a bug, please report it here https://github.com/flood-io/element/issues/new?template=bug_report.md',
	)

	process.exit(1)
}

const handleRejection = (err: Error) => {
	debug('handling rejection', err)

	if (err) {
		if (err instanceof Error) {
			handleUnexpected(err)
		} else {
			console.error(error(`An unexpected rejection occurred\n  ${err}`))
		}
	} else {
		console.error(error(`An unexpected empty rejection occurred\n rejection: ${err}`))
	}
	console.error(
		'this is a bug, please report it here https://github.com/flood-io/element/issues/new?template=bug_report.md',
	)

	process.exit(1)
}

process.on('unhandledRejection', handleRejection)
process.on('uncaughtException', handleUnexpected)

export async function main(rootPath: string) {
	const pkg = require(join(rootPath, 'package.json'))
	await updateCheck(pkg)

	return argv
		.usage(chalk`{bold {blueBright element}} <command> {grey [options]}`)
		.command(initCmd)
		.command(generateCmd)
		.command(planCmd)
		.command(runCmd)
		.updateStrings({
			'Commands:': chalk.grey('Commands:\n'),
			'Options:': chalk.grey('Options:\n'),
		})
		.version(pkg.version)
		.demandCommand()
		.help('help')
		.showHelpOnFail(true)
		.recommendCommands()
		.example(
			'element run ./examples/flood-challenge.ts',
			'Run the Flood Challenge example script in your local browser',
		)
		.epilogue(`For more information on Flood Element, see https://element.flood.io`).argv
}
