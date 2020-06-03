module.exports = {
    options: {
        headless: true,
        devtools: false,
        sandbox: true,
        watch: false,
        stepDelay: -1,
        actionDelay: -1,
        loopCount: 1,
        strict: false,
        failStatusCode: 1
    },
    paths: {
        workRoot: '.',
        testDataRoot: '.',
        testPathMatch: ['./*.perf..ts']
    },
    flood: {
        token: '',
        project: '',
        hosted: fe,
        vu: 500,
        duration: 15,
        rampup: 0,
        regions: ['us-east-1', '']
    }
}