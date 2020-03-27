---
title: ''
---
# `ENV`

A subset of `process.env` available to this test. It is of type <[FloodProcessEnv]>.

# `FloodProcessEnv`

#### properties
* `BROWSER_ID` &lt;number&gt;       
* `FLOOD_GRID_INDEX` &lt;number&gt;       
* `FLOOD_GRID_NODE_SEQUENCE_ID` &lt;number&gt;       
* `FLOOD_GRID_REGION` &lt;string&gt;       
* `FLOOD_GRID_SEQUENCE_ID` &lt;number&gt;       
* `FLOOD_GRID_SQEUENCE_ID` &lt;number&gt;       
* `FLOOD_LOAD_TEST` &lt;boolean&gt;     `true` when running as a load test on https://flood.io  
  `false` otherwise  
    
  This can be useful for changing settings based on whether you're  
  testing your script locally or running it as a fully fledged load test.  
    
* `FLOOD_NODE_INDEX` &lt;number&gt;       
* `FLOOD_PROJECT_ID` &lt;number&gt;       
* `FLOOD_SEQUENCE_ID` &lt;number&gt;       
* `SEQUENCE` &lt;number&gt;     Globally unique sequence number for this browser instance.  
# `StepOptions`

Specifies the available options which can be supplied to a step to override global settings.

**Example:**

```typescript
step('Step 1', { waitTimeout: 300 }, async (browser: Browser) => {
	await browser.click(...)
})
```

#### properties
* `waitTimeout` &lt;undefined | number&gt;  (Optional)   Timeout in seconds for all wait and navigation operations within this <[step]>.  
## `StepFunction`
The `StepFunction` type represents a function to be called as a Test step.

- `browser` <[Browser]> the browser
- `data` <`T`> (Optional) a row of test data of type <`T`>. Only available when the test is set up using <[suite]>.

**Example:**

```typescript
const step1: StepFunction = async (browser: Browser) => {
	await browser.click(...)
}
```

#### `step(name, fn)`
* `name` &lt;string&gt;   Step Name
* `fn` &lt;[StepFunction]&gt;   Actual implementation of step

* returns: &lt;void&gt; 

Declares each step in your test. This must go within your main test expression.

**Example:**

```typescript
export default () => {
  step('Step 1', async (browser: Browser) => {
    await browser.visit('https://example.com')
  })

  step('Step 2', async (browser: Browser) => {})

  step('Step 3', async (browser: Browser) => {})
}
```

#### `step(name, options, fn)`
* `name` &lt;string&gt;   
* `options` &lt;[StepOptions]&gt;   
* `fn` &lt;[StepFunction]&gt;   
* returns: &lt;void&gt; 

`step` can also be called with an overridden subset of Test settings (`options`) valid for just this step.

```typescript
  // Step 1 takes longer than the default `waitTimeout` of 30s.
  step('Step 1', { waitTimeout: 90 }, async browser => {
    ...
  }
```

# `suite`

Defines a test suite of steps to run.

**Example:**
```
  import { TestData } from '@flood/element'
  interface Row {
    user: string
    systemID: number
  }
  const testData = TestData.withCSV<Row>(...)

  export default suite.withData((testData, step) => {
    step('Step 1', async (row: Row, browser: Browser) => {
      await browser.visit(`http://example.com/user-${row.systemID}.html`)
    })
  })
```


[FloodProcessEnv]: ../../api/DSL.md#floodprocessenv
[step]: ../../api/DSL.md#step
[Browser]: ../../api/Browser.md#browser
[suite]: ../../api/DSL.md#suite
[StepFunction]: ../../api/DSL.md#stepfunction
[StepOptions]: ../../api/DSL.md#stepoptions
