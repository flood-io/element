---
title: Examples - Test Data Generation
---

# Examples - Test Data

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

And to use the data in your steps:

```typescript
step('Step 1', (browser: Browser, row: any) => {
  await browser.visit(`http://examplecorp.com/users/${row.id}.html`)
  
  await browser.wait(Until.elementIsVisible(By.partialVisibleText(String(row.id))))
})
```

## Loading data from a CSV

If you have data available in a CSV file, perhaps exported from Excel, you can use it to power your test:

```typescript
TestData.fromCSV('test-data.csv')
```

### CSV column names
Note that the first line of each column is taken to be the name of that column.

This means that if your column names contain spaces, you won't be able to use the javascript `.` property access notation.
Instead use `[]` notation.

The CSV
```csv
query name,url
green,https://en.wikipedia.org/wiki/Green
```
would be accessed as follows:
```typescript
row['query name']
row.url
```

### Data file locations

When running Element in cli mode (`element run`), place the CSV in the same directory as your test script.
When its running as a load test on flood.io, upload the script TODO

## Loading data from a JSON

Loading data from a JSON is as simple as loading from CSV

```typescript
TestData.fromCSV('test-data.json')
```

## Type checking

Flood Element scripts are written in TypeScript and are thus typechecked before being run.
Although its possible to define test data using the `any` type (as in the examples above), test data is a very good place to take the extra time to define some more specific types:

```typescript
interface UserData {
  username: string
  reportCount: number
}

TestData.fromCSV<UserData>('test-data.csv')

step('Step 1 - reports', (browser: Browser, data: UserData) => {
  await browser.visit(`http://examplecorp.com/users/${data.username}.html`)
  
  const reports = await browser.findElements(By.css("#reports > li"))
  
  assert.equal(reports.length, data.reportCount, "all user reports found")
})
```





