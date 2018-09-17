import { Argv, Arguments } from 'yargs'
import { inspect } from 'util'
import { EvaluatedScript, nullRuntimeEnvironment } from '@flood/element/api'
import chalk from 'chalk'
import { checkFile } from './common'

function rpad(n: number, maxN: number, padChar = ' '): string {
	const ns = String(n)
	const width = String(maxN).length
	if (ns.length >= width) return ns
	return ns + padChar.repeat(width - ns.length)
}

const main = async (args: Arguments) => {
	const script = await EvaluatedScript.mustCompileFile(args.file, nullRuntimeEnvironment)

	if (args.json) return printJSON(script)

	const { settings, steps } = script

	console.log(chalk`
{green *************************************************************}
{green *} test script: {blue ${settings.name || '<no name>'}}
{green *} {blue ${settings.description || '<no description>'}}
{green *************************************************************}
`)

	console.log(chalk`{blue Settings}:`)
	console.log(inspect(settings, { colors: true }))
	console.log()
	console.log(
		chalk`{blue The test script has ${String(steps.length)} step${steps.length !== 1 ? 's' : ''}}:`,
	)

	steps.forEach((step, i) => {
		console.log(chalk`{blue step ${rpad(i + 1, steps.length)}}: ${step.name}`)
	})
	console.log()

	console.log(chalk`{blue Test data:}`)
	console.log(script.testData.toString())
	console.log()
}

function printJSON(script: EvaluatedScript) {
	const o = {
		settings: script.settings,
		steps: script.steps.map(s => s.name),
	}
	console.log(JSON.stringify(o, null, '  '))
}

export const command = 'plan <file> [options]'
export const describe = 'Output the test script plan without executing it.'
export const builder = (yargs: Argv) => {
	yargs
		.option('json', {
			describe: 'Return the test output as JSON',
			default: !process.stdout.isTTY,
		})
		.check(({ file }) => {
			let fileErr = checkFile(file)
			if (fileErr) return fileErr

			return true
		})
}
export const handler = main
