#!/usr/bin/env node
/**
 * Copyright (c) Tricentis Corp. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the Apache-2 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import importLocal from 'import-local'
import debugFactory from 'debug'

const debug = debugFactory('element:cli')

if (!importLocal(__filename)) {
	debug('Using global element installation')
	require('element-cli/bin/element')
} else {
	debug('Using local element installation')
}
