# `TestData`

Use this to load test data which will be iterated over with each iteration of your test.

#### `testData.circular([, circular])`
* `circular` <boolean> (Optional) optional, pass `false` to disable
* returns: <this> 

Instructs the data feeder to repeat the data set when it reaches the end.

#### `testData.filter(func)`
* `func` <[FeedFilterFunction]>  filter function to compare each line
* returns: <this> 

Adds a filter to apply against each line in the data set.

Filters can be chained, and will be run in order only if the previous ffilter passed.

Example:
	```
		type Row = { browser: string, email: string }
		TestData.fromCSV("users.csv").filter((line, index, browserID) => line.browser === browserID)
 ```

#### `testData.shuffle([, shuffle])`
* `shuffle` <boolean> (Optional) optional, pass `false` to disable
* returns: <this> 

Shuffles the data set using the Fisher-Yates method. Use this to randomise the order of your data. This will always be applied after filtering.

#### `testData.fromCSV(filename[, seperator])`
* `filename` <string>  
* `seperator` <string> (Optional) 
* returns: <[TestData]> 

Loads test data from a CSV file, returning a `TestData` instance.

#### `testData.fromData(lines)`
* `lines` <undefined[]>  
* returns: <[TestData]> 

Loads a standard Javascript array of data objects

#### `testData.fromJSON(filename)`
* `filename` <string>  
* returns: <[TestData]> 

Loads data from a JSON ffile


[FeedFilterFunction]: Interfaces.md#feedfilterfunction
[TestData]: TestData.md#testdata