---
id: script
title: Test steps
---

Element tests are defined as a series of steps, which are run in sequence. Unlike other functional testing tools which encourage step isolation, Element is about defining a user journey through an application as a series of steps.

During execution, the timing of each step can be measured so that you can profile the throughput and performance of specific sections of the user journey. Timing can be measured as wall clock time, network time, and subsets of each.

## Defining steps

You first need to import the step creator from the Element package:

```ts title="my-test.perf.ts"
import { step } from "@flood/element";
```

Each test must export a defualt suite, which is what Element will use to detect the steps to run:

```ts title="my-test.perf.ts"
import { step } from "@flood/element";

export default () => {
  ...
};
```

The next step is to define a list of steps using the step helper:

```ts title="my-test.perf.ts"
import { step } from "@flood/element";

export default () => {
  step("Step 1", async () => {
    ...
  })

  step("Step 2", async () => {
    ...
  })

  step("Step 3", async () => {
    ...
  })

};
```

What we did here was defined 3 steps, giving each a descriptive title, and a callback function which will contain the actual business logic of our test, in the form of test actions.

## Defining test actions

A test without actions is pretty bare, so lets instruct the browser to navigate to a page:

```diff title="my-test.perf.ts"
import { step } from "@flood/element";

export default () => {
  step("Step 1", async (browser) => {
+   await browser.visit("https://google.com")
  })
};
```

You'll notice that we pulled the `browser` from the first argument received by the callback function. You also have access to the current `row` of test data if you've specified a test data service.

The browser exposes every action avaialable to you at a top level for interacting with the page. See the [Browser API](api/Browser.md) page for a complete list.

## Handling failure

A test step can fail for a number of reasons, most commonly though it will be because the state of the page wasn't as you expected it to be, which might in turn be because the application is overloaded, an error message is shown, or the inventory of stock you're testing against is exhausted.

Handling failures is part of building a robust performance test suite. Because Element scripts are JavaScript, you can use any error handling you typically would in JS, including `try/catch` or `.catch(...)`. However, keep in mind that using `try/catch` will include the catch time in the total time because Element isn't aware of the time you're spending on this step.


```diff title="my-test.perf.ts"
import { step } from "@flood/element";

export default () => {
  step("Step 1", async (browser) => {
   await browser.visit("https://google.com")

+   try {
+     // maybe do something here
+   }catch {
+    // recover here
+   }
})
};
```



