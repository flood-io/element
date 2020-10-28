---
id: test-data
title: Using Test Data
---

## Overview

Flood Element includes a simple facility for loading Test Data from CSV and JSON files, or as a list of data specified directly in the script.

## Loading data from inside the script

The simplest way to provide data to your test is right from the script itself:

```typescript
TestData.fromData([
  { username: 'bob.smith', id: 1 },
  { username: 'arthur.dent', id: 42 },
])
```

You may then use the data in your steps:

```typescript
step('Step 1', async (browser: Browser, row: any) => {
  await browser.visit(`http://examplecorp.com/users/${row.id}.html`)
  
  await browser.wait(Until.elementIsVisible(By.partialVisibleText(String(row.id))))
})
```

## Loading data from external files

For larger or more complicated data sets, you may load data from CSV or JSON files.


### Loading data from a CSV file

If you have data available in a CSV file, perhaps exported from Excel, you can use it to power your test:

```typescript
TestData.fromCSV('test-data.csv')
```

#### CSV column names

Note that the first line of each column is taken to be the name of that column.

This means that if your column names contain spaces, you won't be able to use the javascript `.` property access notation.
Instead use `[]` notation.

The CSV

```csv
query name,url
green,https://en.wikipedia.org/wiki/Green
```

would be accessed as:

```typescript
row['query name']
row.url
```

### Loading data from a JSON file

Loading data from a JSON is just as simple as loading from CSV

```typescript
TestData.fromJSON('test-data.json')
```

### Data file locations

When running Element in cli mode (`element run`), place the data files in the same directory as your test script.

When its running as a load test on [flood.io](https://flood.io), upload the data files alongside your script.

## Using multiple test data files in a single test script

Since Element 1.4, you can use multiple data files within a single test script by giving an alias for each file.

```typescript
interface User {
	username: string
	reportCount: number
}

interface Order {
	id: string
	productName: string
}
// import the data from multiple data files
TestData.fromCSV<User>('users*.csv').as('user')
TestData.fromJSON<Order>('order.json')
	.as('order')
	.shuffle()
export default () => {
	step('Step 1', async (browser: Browser, data: { user: User; order: Order }) => {
		// verify and use the data
		assert.ok(data.user.username, 'username is set')
		assert.notEqual(data.order.productName, undefined, 'productName is set')
	})
}
```

**Notes:**

1. In case no alias is set, then Element will auto-set the alias of the data with the name of the file (without the file extension). However, if the data were imported using `fromData()`, you need to specify the alias.
2. Data files that have the same structure (for example, same number of columns and data types) can be concatenated and used under the same alias.
3. Element 1.4 supports [glob](https://www.npmjs.com/package/glob) to find the data files that match the specified pattern, then concatenate them under 1 alias. As in the example above, supposed you have `user1.csv`, `user2.csv`,... and want to quickly import and concatenate them, just use the `user*.csv` pattern and Element will do the rest.
4. Data files imported using different methods (for example, 1 by `fromCSV()` and 1 by `fromJSON()`) cannot have the same alias.
5. When multiple data files are used, the `circular()` option is turned on by default, and whichever file reaches its end-of-file first will begin its next loop first (if the number of data rows is lower than the number of test iterations).

## Advanced topic: ensuring your data is well-defined

When it's important that your test data is well-defined, Flood Element provides two main approaches: type checking and manual assertion

### type checking

Element test scripts are written in [TypeScript] and are thus type checked before being run. Type checking helps write more reliable code (as well as providing documentation and code completion in your editor).

Its possible to define test data using the `any` type (as in the examples above). However you could also add explicit type annotations:

```typescript
import { step, TestData, Browser } from '@flood/element'

interface UserData {
  username: string
  reportCount: number
}

// Define test data.
// Only data implementing the UserData interface is allowed
TestData.fromData<UserData>([
  { username: 'bob', reportCount: 1 },
])
// example invalid data:
// { username: null }
// { username: 'fred', reportCount: 'none' }

step('Step 1 - reports', async (browser: Browser, data: UserData) => {
  await browser.visit(`http://examplecorp.com/users/${data.username}.html`)
  
  const reports = await browser.findElements(By.css('#reports > li'))
  
  assert.equal(reports.length, data.reportCount, 'all user reports found')
})
```

### manual assertion
A hidden problem with the type checking approach is that it's not possible to automatically type check data loaded in from a CSV or JSON at runtime (The techinal reason is that [TypeScript]'s type annotations are not available at runtime - they're said to be "erased" once compiled)

When loading in data from a file, we can still validate it by using `assert`. (Note that in this example we're still using type annotations to make the coding experience better)

```typescript
import { step, TestData, Browser } from '@flood/element'
import assert from 'assert'

interface UserData {
  username: string
  reportCount: number
}

// Load the test data.
TestData.fromCSV<UserData>('users.csv')

step('Step 1 - reports', async (browser: Browser, data: UserData) => {
  // check that data.username is 'truthy'
  assert.ok(data.username, 'data.username is set')
  
  // check that data.reportCount is defined. 
  // Here we check that row.reportCount  !== undefined because the number 0 is considered to be 'falsy'
  // in javascript
  assert.notEqual(data.reportCount, undefined, 'data.reportCount is set')
  
  ...
})
```

#### truthiness and falsiness

'Truthiness' and 'falsiness' refer to the fact that in Javascript (and thus [TypeScript]), more values than `true` and `false` are considered to be `true` or `false` in an `if` statement.

Falsy values are `false`, `""` (an empty string), `0`, `NaN`, `null` and `undefined`; all other values are truthy.

Its important to understand this when validating data, since for example a value of `0` might be valid, but would be considered to be `false` when tested with `assert.ok(0)`.

## More information

Find more information in the API reference for [TestData], [TestDataFactory] and [TestDataSource], or check out the [Flood challenge with test data][challenge-with-test-data] example script.

[TypeScript]: https://www.typescriptlang.org/
<!-- suffix -->

[TypeScript]: https://www.typescriptlang.org/
[TestData]: ../api/TestData.md#testdata
[TestDataFactory]: ../api/TestData.md#testdatafactory
[TestDataSource]: ../api/TestData.md#testdatasource