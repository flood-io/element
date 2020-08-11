/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

require('ts-node').register({
	transpileOnly: true,
})

const path = require('path')
require(path.resolve(__dirname, 'entry.ts'))
