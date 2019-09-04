import * as argv from 'yargs'
import chalk from 'chalk'
import { join } from 'path'
import { error } from './utils/out/error'
import ownPackage from './utils/ownPackage'
import * as semver from 'semver'
import * as commandExists from 'command-exists'

const debug = require('debug')('element:main')

import * as checkForUpdate from 'update-check'
import * as ms from 'ms'

const cmdRoot = join(__dirname, 'cmd')

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

export async function main() {
	const pkg = ownPackage()

	await doUpdateCheck(pkg)

	return argv
		.usage(chalk`{bold {blueBright element}} <command> [options]`)
		.commandDir(cmdRoot, {
			extensions: ['js', 'ts'],
		})
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
			'$0 run ./examples/flood-challenge.ts',
			'Run the Flood Challenge example script in your local browser',
		)
		.epilogue(`For more information on Flood Element, see https://element.flood.io`).argv
}

const info = (...msgs: string[]) => `${chalk.gray('>')} ${msgs.join('\n')}`

async function doUpdateCheck(pkg: any) {
	if (!process.stdout.isTTY) return

	try {
		// 1.0.1 -> latest
		// 1.0.1-beta.1 -> beta
		const validDistTags = ['latest', 'beta']
		let distTag = 'latest'

		const prerelease = semver.prerelease(pkg.version) || []
		if (prerelease) {
			if (validDistTags.includes(prerelease[0])) distTag = prerelease[0]
		}

		const update = await checkForUpdate(pkg, {
			interval: ms('1d'),
			distTag,
		})

		if (update) {
			printUpdateMessage(pkg.version, distTag, update)
		}
	} catch (err) {
		console.error(error(`Checking for updates failed`))
		console.error(err)
	}
}

type update = { latest: string }

function printUpdateMessage(version: string, distTag: string, update: update) {
	console.log(
		info(
			chalk`{bgRed 'UPDATE AVAILABLE'} The latest ${
				distTag === 'latest' ? '' : distTag
			}  version of Element CLI is ${update && update.latest}`,
		),
	)

	const updateMsg =
		[
			brewUpdateMessage(version, distTag, update),
			yarnUpdateMessage(version, distTag, update),
			npmUpdateMessage(version, distTag, update),
		].find(x => !!x) || 'unreachable'

	console.log(info(updateMsg))
}

function brewUpdateMessage(version: string, distTag: string, update: update): string | undefined {
	const brew = commandExists('brew')
	if (__dirname.includes('Cellar') && brew) {
		let brewSpec: string
		if (distTag === 'latest') {
			brewSpec = 'element'
		} else {
			const { latest } = update
			const major = semver.major(latest)
			const minor = semver.minor(latest)
			const patch = semver.patch(latest)
			brewSpec = `element@${major}.${minor}.${patch}-${distTag}`
		}
		return chalk`Get it by running {greenBright brew upgrade ${brewSpec}}`
	}
}

function yarnUpdateMessage(version: string, distTag: string, update: update): string | undefined {
	if (commandExists('yarn')) {
		return chalk`Get it by running {greenBright yarn global upgrade @flood/element-cli@${distTag}}`
	}
}

// fallback
function npmUpdateMessage(version: string, distTag: string, update: update): string {
	return chalk`Get it by running {greenBright npm -g update @flood/element-cli@${distTag}}`
}
