import { Argv, Arguments, CommandModule } from 'yargs'

import { authenticate } from '../../utils/flood'

interface AuthenticateArguments extends Arguments {
	token: string
}

const cmd: CommandModule = {
	command: 'authenticate <token>',
	describe: 'Authenticate with Flood using Flood API Token',

	async handler(args: AuthenticateArguments) {
		const { token } = args

		try {
			await authenticate(token)
			console.log('Successfully authenticated')
		} catch (err) {
			if (err.message === 'Not Authenticated') {
				throw 'The token you have input is invalid. Please check and try again'
			} else throw err
		}
	},
	builder(yargs: Argv): Argv {
		return yargs.positional('token', {
			describe: 'API Token provided by Flood',
		})
	},
}

export default cmd
