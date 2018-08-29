---
title: ''
---
# `TestDataImpl`

#### `testDataImpl.circular(circular)`
* `circular` &lt;boolean&gt;  optional, pass `false` to disable

* returns: &lt;[TestDataImpl]&gt; 

Instructs the data feeder to repeat the data set when it reaches the end.

#### `testDataImpl.feed()`
* returns: &lt;[Option]&gt; 

#### `testDataImpl.filter(func)`
* `func` &lt;[FeedFilterFunction]&gt;  filter function to compare each line

* returns: &lt;[TestDataImpl]&gt; 

Adds a filter to apply against each line in the data set.

Filters can be chained, and will be run in order only if the previous ffilter passed.

Example:
```typescript
type Row = { browser: string, email: string }
TestData.fromCSV("users.csv").filter((line, index, browserID) => line.browser === browserID)
```

#### `testDataImpl.load()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

#### `testDataImpl.peek()`
* returns: &lt;[Option]&gt; 

#### `testDataImpl.setInstanceID(id)`
* `id` &lt;string&gt;  
* returns: &lt;void&gt; 

#### `testDataImpl.shuffle(shuffle)`
* `shuffle` &lt;boolean&gt;  optional, pass `false` to disable

* returns: &lt;[TestDataImpl]&gt; 

Shuffles the data set using the Fisher-Yates method. Use this to randomise the order of your data. This will always be applied after filtering.

* `feeder` &lt;[Feeder]&gt;      
* `instanceID` &lt;string&gt;      
* `loader` &lt;[Loader]&gt;      
# `TestData`

Use this to load test data which will be iterated over with each iteration of your test.

#### `testData.fromCSV(filename, seperator)`
* `filename` &lt;string&gt;  
* `seperator` &lt;string&gt;  
* returns: &lt;[TestDataImpl]&gt; 

Loads test data from a CSV file, returning a `TestData` instance.

#### `testData.fromData(lines)`
* `lines` &lt;undefined[]&gt;  
* returns: &lt;[TestDataImpl]&gt; 

Loads a standard Javascript array of data objects

#### `testData.fromJSON(filename)`
* `filename` &lt;string&gt;  
* returns: &lt;[TestDataImpl]&gt; 

Loads data from a JSON ffile


[TestDataImpl]: ../../api/TestData.md#testdataimpl
[Option]: ../..#option
[FeedFilterFunction]: ../..#feedfilterfunction
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

[TestDataImpl]: ../../api/TestData.md#testdataimpl