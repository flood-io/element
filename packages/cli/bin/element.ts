#!/usr/bin/env node
/**
 * Copyright (c) Tricentis Corp. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the Apache-2 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-ignore
// @ts-ignore
import importLocal from 'import-local'
import findRoot from 'find-root'
import { main } from '../src/index'

if (importLocal(__filename)) {
	console.log(`Using local version of Element`)
} else {
	const root = findRoot(__dirname)
	main(root)
}
