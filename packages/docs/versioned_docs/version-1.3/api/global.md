---
title: Environment
id: env
---

### `ENV`

A subset of `process.env` available to this test. It is of type [FloodProcessEnv][].

# `FloodProcessEnv`

**Properties**

- `BROWSER_ID` `number`
- `FLOOD_GRID_INDEX` `number`
- `FLOOD_GRID_NODE_SEQUENCE_ID` `number`
- `FLOOD_GRID_REGION` `string`
- `FLOOD_GRID_SEQUENCE_ID` `number`
- `FLOOD_GRID_SQEUENCE_ID` `number`
- `FLOOD_LOAD_TEST` `boolean` `true` when running as a load test on <https://flood.io>
  `false` otherwiseThis can be useful for changing settings based on whether you're
  testing your script locally or running it as a fully fledged load test.
- `FLOOD_NODE_INDEX` `number`
- `FLOOD_PROJECT_ID` `number`
- `FLOOD_SEQUENCE_ID` `number`
- `SEQUENCE` `number` Globally unique sequence number for this browser instance.

# `StepOptions`

Specifies the available options which can be supplied to a step to override global settings.

**Example:**

```typescript
step("Step 1", { waitTimeout: 300 }, async (browser: Browser) => {
	await browser.click(...)
})
```

**Properties**

- waitTimeout? `number` (Optional) Timeout in seconds for all wait and navigation operations within this step.

## `StepFunction`

The `StepFunction` type represents a function to be called as a Test step.

- `browser` [Browser][] the browser
- `data` &lt;`T`> (Optional) a row of test data of type &lt;`T`>. Only available when the test is set up using [suite][].

**Example:**

```typescript
const step1: StepFunction = async (browser: Browser) => {
	await browser.click(...)
}
```

### `step(name, fn)`

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

**Parameters**

- name `string` Step Name
- fn [`StepFunction`][stepfunction] Actual implementation of step
- returns: `void`

### `step(name, options, fn)`

`step` can also be called with an overridden subset of Test settings (`options`) valid for just this step.

```typescript
  // Step 1 takes longer than the default `waitTimeout` of 30s.
  step("Step 1", { waitTimeout: 90 }, async browser => {
    ...
  }
```

**Parameters**

- name `string`
- options [`StepOptions`][stepoptions]
- fn [`StepFunction`][stepfunction]
- returns: `void`

### `suite`

Defines a test suite of steps to run.

**Example:**

```typescript
import { TestData } from '@flood/element'
interface Row {
  user: string
  systemID: number
}
const testData = TestData.withCSV<Row>(...)

export default suite.withData((testData, step) => {
  step("Step 1", async (browser: Browser, row: Row) => {
    await browser.visit(`http://example.com/user-${row.systemID}.html`)
  })
})
```

[floodprocessenv]: #floodprocessenv
[browser]: Browser
[suite]: #suite
[stepfunction]: #stepfunction
[stepoptions]: #stepoptions
