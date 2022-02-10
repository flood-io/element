---
id: scripting
title: Scripting in Element
---

## Overview of script configuration settings

Some initial script parameters need to be stated at the very start of the script - let's delve into them line by line:

### 1. Imports

```ts title="my-test.perf.ts"
import { step, TestSettings, Until, By } from '@flood/element'
import assert from 'assert'
```

The initial import statement allows you to add classes relating to test steps, test settings, and By functions etc. that are needed by the script to carry out actions against objects you have defined. For basic tests the included classes above should suffice. You will need to review these if you require further functionality from other classes that are not listed above.

To see other classes you can import and what they do, check out our API section.

The importing of the assert class is useful if you would like to use assertions to capture and verify strings/integers or any data retrieved from objects during test execution. This can also be reported in the console.

### 2. Global test settings

```ts title="my-test.perf.ts"
import { TestSettings } from '@flood/element'

export const settings: TestSettings = {
	loopCount: -1,
	description: 'The Flood Store - Detailed Tutorial',
	screenshotOnFailure: true,
	disableCache: true,
	clearCache: true,
	clearCookies: true,
	actionDelay: 1.5,
	stepDelay: 2.5,
}
```

This export block allows you to specify constants related to typical Test Settings used in all load tests:

- `loopCount`: Used to specify how many iterations (or loops) you would like each user to run. If commented out or not included, the test will loop forever.
- `description`: A simple description sentence describing the aim of the test scenario.
- `screenshotOnFailure`: A screenshot of the current page will automatically be generated when Flood Element detects a failure has occurred. These are viewable in the captured results for each Flood.
- `disableCache` / clearCache: No caching is done if this is set to true.
- `clearCookies`: Any cookies detected will be cleared for each iteration if this is set to true.
- `actionDelay`: the amount of time in seconds that the Flood Element replay engine will wait in between actions contained within a step.
- `stepDelay`: the amount of time in seconds that the Flood Element replay engine will wait in between steps.

### 3. Test suite export

The `export default()` function is the main area housing all the steps for your business process.

```ts title="my-test.perf.ts"
import { step } from '@flood/element'

export default () => {
	step('Login', async (browser) => {
		// ... add actions here
	})
}
```

## Creating a step and navigating to a webpage

Now that you've imported the required classes, set the test settings, and added the `export default() => { ... }` block, we can start getting to the meat of the script.

Scripts in Element are broken up into steps. Each step is equivalent to a transaction or label in other tools. The "response time" that Element reports after execution is the time it takes for all the code within a step to be executed. This is why what you put in a step is important.

For example, it wouldn't be very useful to write a script that navigates to a site, logs in, purchases an item, and logs out _all within one step_, because it would be difficult to tell which part of that whole process needs performance tuning. It could be that logging in takes up 90% of the time-- you'd never know. To prevent this, it's good practice to separate the actions you want to measure into steps.

```ts title="my-test.perf.ts"
import { step, By, Until } from '@flood/element'

export default () => {
	step('Login', async (browser) => {
		await browser.visit('https://challenge.flood.io')
		await browser.wait(Until.elementIsVisible(By.id('username')))
	})

	step('A second step', async (b) => {})

	step('A third step', async (b) => {})
}
```

You'll notice that each takes two arguments: a title, which is the name of the step when reporting the results, and a function or expression which contains the actual actions, which we call the step handler.

The step handler receives two arguments: the Browser instance, and the Data instance — if you're using [test data](../api/test-data). You can name these variables however you like, but we typically use either `browser` or `b`.

## Running an Element script locally

To run a script, simply navigate to the directory it's saved in and type `element run test.ts`. This will run the script headlessly on your local machine for one iteration. If you'd like to see what's happening in the browser, try

```shell
element run my-test.perf.ts --no-headless
```

---

Now you're all set up with your first basic test. To learn how to make more advanced test scripts, navigate to our guides on the left column.
