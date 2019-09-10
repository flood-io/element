import checkForUpdate from 'update-check'
import commandExists from 'command-exists'
import ms from 'ms'
import chalk from 'chalk'
import { error } from './error'
import { info } from './info'
import { Package } from 'normalize-package-data'
import { prerelease, major, minor, patch } from 'semver'

export async function updateCheck(pkg: Package) {
	if (!process.stdout.isTTY) return

	if (!pkg.name) {
		console.error(error(`Failed to read package.json while checking for update`))
		return
	}

	try {
		// 1.0.1 -> latest
		// 1.0.1-beta.1 -> beta
		const validDistTags = ['latest', 'beta']
		let distTag = 'latest'

		const versionParts = prerelease(pkg.version) || []
		if (versionParts) {
			if (validDistTags.includes(versionParts[0])) distTag = versionParts[0]
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

type Update = { latest: string }

function printUpdateMessage(version: string, distTag: string, update: Update) {
	console.log(
		info(
			chalk`{bgRed UPDATE AVAILABLE} The latest ${
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

function brewUpdateMessage(version: string, distTag: string, update: Update): string | undefined {
	const brew = commandExists('brew')
	if (__dirname.includes('Cellar') && brew) {
		let brewSpec: string
		if (distTag === 'latest') {
			brewSpec = 'element'
		} else {
			const { latest } = update
			const semVerMajor = major(latest)
			const semVerMinor = minor(latest)
			const semVerPatch = patch(latest)
			brewSpec = `element@${semVerMajor}.${semVerMinor}.${semVerPatch}-${distTag}`
		}
		return chalk`Get it by running {greenBright brew upgrade ${brewSpec}}`
	}
}

function yarnUpdateMessage(version: string, distTag: string, update: Update): string | undefined {
	if (commandExists('yarn')) {
		return chalk`Get it by running {greenBright yarn global upgrade @flood/element-cli@${distTag}}`
	}
}

// fallback
function npmUpdateMessage(version: string, distTag: string, update: Update): string {
	return chalk`Get it by running {greenBright npm -g update @flood/element-cli@${distTag}}`
}
