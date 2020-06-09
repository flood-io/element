import { Argv, CommandModule } from 'yargs'
import { checkFile } from '../common'
import { join } from 'path'
import {
    getWorkRootPath,
    getTestDataPath,
    initRunEnv,
    makeTestCommander,
    setupDelayOverrides,
    RunCommonArguments,
} from '../run_cmds/runCommon'
import createLogger from '../../utils/Logger'
import { ConsoleReporter } from '../../utils/ConsoleReporter'
import {
    runCommandLine,
    ElementOptions,
} from '@flood/element-core'

interface RunConfigArguments extends RunCommonArguments {
    configFile: string
}

const cmd: CommandModule = {
    command: '$0 [options]',
    describe: 'Run test scripts locally with configuration',

    handler(args: RunConfigArguments) {
        const rootPath = process.cwd()
        const { options, paths } = require(join(rootPath, args.configFile))

        if (!paths.testPathMatch || !paths.testPathMatch.length) {
            return new Error(`Please provide values of testPathMatch in ${args.configFile}`)
        }
        const glob = require('glob')
        const files = paths.testPathMatch.reduce((arr, item) => arr.concat(glob.sync(item)), [])
        if (!files.length) {
            return new Error(`Can not find any test script to run with configuration. Please check values of testPathMatch in ${args.configFile} file again`)
        }

        console.log(`Preparing to run test scripts: ${files}`)
        files.forEach(file => {
            const workRootPath = getWorkRootPath(file, args['work-root'])
            const testDataPath = getTestDataPath(file, args['test-data-root'])

            let logLevel = 'info'
            const logger = createLogger(logLevel, true)
            const reporter = new ConsoleReporter(logger, false)

            logger.info(`workRootPath: ${workRootPath}`)
            logger.info(`testDataPath: ${testDataPath} `)

            const opts: ElementOptions = {
                logger: logger,
                testScript: file,
                strictCompilation: options.strict ?? false,
                reporter: reporter,
                verbose: false,
                headless: options.headless ?? true,
                devtools: options.devtools ?? false,
                chromeVersion: undefined,
                sandbox: options.sandbox ?? true,

                runEnv: initRunEnv(workRootPath, testDataPath),
                testSettingOverrides: {},
                persistentRunner: false,
                failStatusCode: options['fail-status-code'],
            }

            if (options.loopCount) {
                opts.testSettingOverrides.loopCount = options.loopCount
            }
            opts.testSettingOverrides = setupDelayOverrides(options, opts.testSettingOverrides)

            if (options.watch) {
                opts.persistentRunner = true
                opts.testCommander = makeTestCommander(file)
            }

            runCommandLine(opts)
        });

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


