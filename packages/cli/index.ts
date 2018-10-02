#!/usr/bin/env node

// useful for debugging - adds stack traces which track through async calls
// import * as bluebird from 'bluebird'

// bluebird.config({
// longStackTraces: true,
// cancellation: true,
// // monitoring: true,
// warnings: true,
// })

// global.Promise = bluebird

import { main } from './src/element'
main()
