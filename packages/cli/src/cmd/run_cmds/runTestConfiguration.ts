import { Argv, Arguments, CommandModule } from 'yargs'

const cmd: CommandModule = {
    command: '$0 [options]',
    describe: 'Run test scripts locally with configuration',

    handler(args: Arguments) {
        console.log('running configuration file')
    },
    builder(yargs: Argv): Argv {
        return yargs
            .option('config-file', {
                describe: 'run with configuration',
                type: 'string',
                default: 'element.config.js'
            })
    },
}

export default cmd


