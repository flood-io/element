#!/usr/bin/env node
/**
 * Copyright (c) Tricentis Corp. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the Apache-2 license found in the
 * LICENSE file in the root directory of this source tree.
 */

// @ts-ignore
import importLocal from 'import-local'

if (!importLocal(__filename)) {
	require('element-cli/bin/element')
}
