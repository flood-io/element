---
title: ''
---
# `TestDataSource`

TestDataSource is the instance returned by <[TestDataFactory]>'s methods.

Call TestDataSource's methods to configure your data source:

```typescript
import { step, Browser, TestData, TestSettings } from '@flood/element'
export const settings: TestSettings = {
  loopCount: -1
}

interface Row {
  username: string
  userID: number
}
TestData.fromCSV<Row>('users.csv')
  .circular(false) // Switch off circular data iteration.
                   // By default, when the end of the data is reached, it wraps to the beginning.
  .shuffle()       // Shuffle the data

export default () => {
   step('Step 1', (browser: Browser, row: Row) => {
     // for each loop, a different line from user.csv will be available as `row`
   })
}
```

#### methods
#### `TestDataSource.circular(circular)`
* `circular` &lt;boolean&gt;  Default: true. Pass `false` to disable.

* returns: &lt;[TestDataSource]&gt; 

Instructs the data feeder to repeat the data set when it reaches the end. TestData is circular by default; use this to turn wrapping off.

#### `TestDataSource.filter(func)`
* `func` &lt;[FeedFilterFunction]&gt;  filter function to compare each line

* returns: &lt;[TestDataSource]&gt; 

Adds a filter to apply against each line in the data set.

Filters can be chained, and will be run in order only if the previous ffilter passed.

Example:
```typescript
type Row = { browser: string, email: string }
TestData.fromCSV("users.csv").filter((line, index, browserID) => line.browser === browserID)
```

#### `TestDataSource.shuffle(shuffle)`
* `shuffle` &lt;boolean&gt;  Default: true. Pass `false` to disable.

* returns: &lt;[TestDataSource]&gt; 

Shuffles the data set using the Fisher-Yates method. Use this to randomise the order of your data. This will always be applied after filtering.

#### properties
* `loader` &lt;[Loader]&gt;      
# `TestDataFactory`

A `TestDataFactory` is available to be imported into your test script as `TestData`. Use this to load a <[TestDataSource> which provides new test data to each iteration of your test.

#### methods
#### `TestDataFactory.fromCSV(filename, seperator)`
* `filename` &lt;string&gt;  
* `seperator` &lt;string&gt;  
* returns: &lt;[TestDataSource]&gt; 

Loads test data from a CSV file, returning a `TestData` instance.

#### `TestDataFactory.fromData(lines)`
* `lines` &lt;undefined[]&gt;  
* returns: &lt;[TestDataSource]&gt; 

Loads a standard Javascript array of data objects

#### `TestDataFactory.fromJSON(filename)`
* `filename` &lt;string&gt;  
* returns: &lt;[TestDataSource]&gt; 

Loads data from a JSON ffile


[TestDataFactory]: ../../api/TestData.md#testdatafactory
[TestDataSource]: ../../api/TestData.md#testdatasource
[FeedFilterFunction]: ../..#feedfilterfunction