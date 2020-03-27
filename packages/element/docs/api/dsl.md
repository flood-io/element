---
title: ''
---

# DSL

## `ENV`

A subset of `process.env` available to this test. It is of type &lt;[FloodProcessEnv](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/DSL.md#floodprocessenv)&gt;.

## `FloodProcessEnv`

#### properties

* `BROWSER_ID` &lt;number&gt;       
* `FLOOD_GRID_INDEX` &lt;number&gt;       
* `FLOOD_GRID_NODE_SEQUENCE_ID` &lt;number&gt;       
* `FLOOD_GRID_REGION` &lt;string&gt;       
* `FLOOD_GRID_SEQUENCE_ID` &lt;number&gt;       
* `FLOOD_GRID_SQEUENCE_ID` &lt;number&gt;       
* `FLOOD_LOAD_TEST` &lt;boolean&gt; `true` when running as a load test on [https://flood.io](https://flood.io)  
  `false` otherwise

  This can be useful for changing settings based on whether you're  
  testing your script locally or running it as a fully fledged load test.

* `FLOOD_NODE_INDEX` &lt;number&gt;
* `FLOOD_PROJECT_ID` &lt;number&gt;       
* `FLOOD_SEQUENCE_ID` &lt;number&gt;       
* `SEQUENCE` &lt;number&gt;     Globally unique sequence number for this browser instance.  

  **`StepOptions`**

Specifies the available options which can be supplied to a step to override global settings.

**Example:**

```typescript
step('Step 1', { waitTimeout: 300 }, async (browser: Browser) => {
    await browser.click(...)
})
```

#### properties

* `waitTimeout` &lt;undefined \| number&gt; \(Optional\) Timeout in seconds for all wait and navigation operations within this &lt;[step](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/DSL.md#step)&gt;.

  **`StepFunction`**

  The `StepFunction` type represents a function to be called as a Test step.

* `browser` &lt;[Browser](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/Browser.md#browser)&gt; the browser
* `data` &lt;`T`&gt; \(Optional\) a row of test data of type &lt;`T`&gt;. Only available when the test is set up using &lt;[suite](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/DSL.md#suite)&gt;.

**Example:**

```typescript
const step1: StepFunction = async (browser: Browser) => {
    await browser.click(...)
}
```

#### `step(name, fn)`

* `name` &lt;string&gt;   Step Name
* `fn` &lt;[StepFunction](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/DSL.md#stepfunction)&gt; Actual implementation of step
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
* `options` &lt;[StepOptions](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/DSL.md#stepoptions)&gt;   
* `fn` &lt;[StepFunction](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/DSL.md#stepfunction)&gt;   
* returns: &lt;void&gt; 

`step` can also be called with an overridden subset of Test settings \(`options`\) valid for just this step.

```typescript
  // Step 1 takes longer than the default `waitTimeout` of 30s.
  step('Step 1', { waitTimeout: 90 }, async browser => {
    ...
  }
```

## `suite`

Defines a test suite of steps to run.

**Example:**

```text
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

