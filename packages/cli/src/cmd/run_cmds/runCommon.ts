import {
    WorkRoot,
    FloodProcessEnv,
    TestCommander,
    TestSettings,
} from '@flood/element-core'
import { Arguments } from 'yargs'
import { watch } from 'chokidar'
import { EventEmitter } from 'events'
import { extname, basename, join, dirname, resolve } from 'path'
import sanitize from 'sanitize-filename'

export interface RunCommonArguments extends Arguments {
    strict?: boolean
    headless?: boolean
    devtools?: boolean
    sandbox?: boolean
    loopCount?: number
    stepDelay?: number
    actionDelay?: number
    fastForward?: boolean
    slowMo?: boolean
    watch?: boolean
    'work-root'?: string
    'test-data-root'?: string
    'fail-status-code': number
}

export function setupDelayOverrides(args: RunCommonArguments, testSettingOverrides: TestSettings) {
    if (testSettingOverrides == null) testSettingOverrides = {}

    testSettingOverrides.actionDelay = args.actionDelay && args.actionDelay > 0 ? args.actionDelay : 0
    testSettingOverrides.stepDelay = args.stepDelay && args.stepDelay > 0 ? args.stepDelay : 0

    if (args.fastForward) {
        testSettingOverrides.stepDelay = 1
        testSettingOverrides.actionDelay = 1
    } else if (args.slowMo) {
        testSettingOverrides.stepDelay = 10
        testSettingOverrides.actionDelay = 10
    }
    return testSettingOverrides
}

export function getWorkRootPath(file: string, root?: string): string {
    const ext = extname(file)
    const bare = basename(file, ext)

    if (root == null) {
        root = join(dirname(file), 'tmp', 'element-results', bare)
    }

    const dateString = sanitize(new Date().toISOString())

    return resolve(root, dateString)
}

export function getTestDataPath(file: string, root?: string): string {
    root = root || dirname(file)

    // return root
    return resolve(root)
}

export function initRunEnv(root: string, testDataRoot: string) {
    const workRoot = new WorkRoot(root, {
        'test-data': testDataRoot,
    })

    return {
        workRoot,
        stepEnv(): FloodProcessEnv {
            return {
                BROWSER_ID: 0,
                FLOOD_GRID_REGION: 'local',
                FLOOD_GRID_SQEUENCE_ID: 0,
                FLOOD_GRID_SEQUENCE_ID: 0,
                FLOOD_GRID_INDEX: 0,
                FLOOD_GRID_NODE_SEQUENCE_ID: 0,
                FLOOD_NODE_INDEX: 0,
                FLOOD_SEQUENCE_ID: 0,
                FLOOD_PROJECT_ID: 0,
                SEQUENCE: 0,
                FLOOD_LOAD_TEST: false,
            }
        },
    }
}


export function makeTestCommander(file: string): TestCommander {
    const commander = new EventEmitter()

    // hax
    // const dir = path.dirname(file)
    // const [first, ...rest] = path.basename(file)
    // const globPath = path.join(dir, `{${first}}${rest.join('')}`)

    // console.log('watching', file, globPath)

    // watch(path.dirname(file)).on('change', (path, stats) => {
    // console.log('changed dir', path, stats)
    // })

    // TODO make this more reliable on linux
    const watcher = watch(file, { persistent: true })
    watcher.on('change', path => {
        if (path === file) {
            commander.emit('rerun-test')
        }
    })
    return commander
}