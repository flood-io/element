import { Argv, Arguments } from 'yargs'
import { existsSync } from 'fs'
import { EvaluatedScript, nullRuntimeEnvironment } from '@flood/element/api'

const main = async (args: Arguments) => {
	const script = await EvaluatedScript.mustCompileFile(args.file, nullRuntimeEnvironment)
	const { settings, steps } = script

	console.log(`
*************************************************************
* Loaded test plan: ${settings.name}
* ${settings.description}
*************************************************************
`)

	console.log(`Settings: ${JSON.stringify(settings, null, 2)}`)
	console.log()
	console.log(`${steps.length} step${steps.length > 1 ? 's' : ''}:`)
	for (const step of steps) {
		console.log(step.name)
	}
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
			if (!file.length) return new Error('Please provide a test script')
			if (!existsSync(file)) return new Error(`File does not exist '${file}'`)
			return true
		})
}
export const handler = main
