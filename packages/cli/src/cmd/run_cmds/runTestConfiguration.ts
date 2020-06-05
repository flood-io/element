import { Argv, Arguments, CommandModule } from 'yargs'
import { checkFile } from '../common'
import { join } from 'path'
import findRoot from 'find-root'

interface RunArguments extends Arguments {
    configFile: string
}

const cmd: CommandModule = {
    command: '$0 [options]',
    describe: 'Run test scripts locally with configuration',

    handler(args: RunArguments) {
        console.log('running configuration file')
        console.log('arg:', args.configFile)
        //const content = require(`./${args.configFile}`)
        // parse current element version
        const rootPath = findRoot(require.resolve('@flood/element'))
        const content = require(join(rootPath, args.configFile))
        console.log(content)
    },
    builder(yargs: Argv): Argv {
        return yargs
            .option('config-file', {
                describe: 'run with configuration',
                type: 'string',
                default: 'element.config.js'
            })
            .check(({ configFile }) => {
                const fileErr = checkFile(configFile as string)
                if (fileErr) return fileErr
                return true
            })
    },
}

export default cmd


