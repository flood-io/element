---
title: ''
---
# `TestData`

#### `testData.circular(circular)`
* `circular` &lt;boolean&gt;  optional, pass `false` to disable

* returns: &lt;[TestData]&gt; 

Instructs the data feeder to repeat the data set when it reaches the end.

#### `testData.feed()`
* returns: &lt;[Option]&gt; 

#### `testData.filter(func)`
* `func` &lt;[FeedFilterFunction]&gt;  filter function to compare each line

* returns: &lt;[TestData]&gt; 

Adds a filter to apply against each line in the data set.

Filters can be chained, and will be run in order only if the previous ffilter passed.

Example:
	```
		type Row = { browser: string, email: string }
		TestData.fromCSV("users.csv").filter((line, index, browserID) => line.browser === browserID)
 ```

#### `testData.load()`
* returns: &lt;[Promise]&lt;void&gt;&gt; 

#### `testData.peek()`
* returns: &lt;[Option]&gt; 

#### `testData.setInstanceID(id)`
* `id` &lt;string&gt;  
* returns: &lt;void&gt; 

#### `testData.shuffle(shuffle)`
* `shuffle` &lt;boolean&gt;  optional, pass `false` to disable

* returns: &lt;[TestData]&gt; 

Shuffles the data set using the Fisher-Yates method. Use this to randomise the order of your data. This will always be applied after filtering.

* `feeder` &lt;[Feeder]&gt;      
* `instanceID` &lt;string&gt;      
* `loader` &lt;[Loader]&gt;      
# `TestDataFactory`

Use this to load test data which will be iterated over with each iteration of your test.

#### `testDataFactory.fromCSV(filename, seperator)`
* `filename` &lt;string&gt;  
* `seperator` &lt;string&gt;  
* returns: &lt;[TestData]&gt; 

Loads test data from a CSV file, returning a `TestData` instance.

#### `testDataFactory.fromData(lines)`
* `lines` &lt;undefined[]&gt;  
* returns: &lt;[TestData]&gt; 

Loads a standard Javascript array of data objects

#### `testDataFactory.fromJSON(filename)`
* `filename` &lt;string&gt;  
* returns: &lt;[TestData]&gt; 

Loads data from a JSON ffile


[TestData]: ../../api/TestData.md#testdata
[Option]: ../..#option
[FeedFilterFunction]: ../..#feedfilterfunction
[Promise]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise