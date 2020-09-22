---
id: script
title: Test steps
---

Element tests are defined as a series of steps, which are run in sequence. Unlike other functional testing tools which encourage step isolation, Element is about defining a user journey through an application as a series of steps.

During execution, the timing of each step can be measured so that you can profile the throughput and performance of specific sections of the user journey. Timing can be measured as wall clock time, network time, and subsets of each.

## Defining steps

You first need to import the step creator from the Element package:

```ts title="my-test.perf.ts"
import { step } from '@flood/element'
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

Here we've defined 3 steps, giving each a descriptive title and a callback function which will contain the actual business logic of our test in the form of test actions.

## Defining test actions

A test without actions is pretty bare, so let's instruct the browser to navigate to a page:

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

A test step can fail for a number of reasons, most commonly because the state of the page was not as expected. These unexpected states may result from your application being overloaded and not displaying the expected page elements, an error message being shown, or test data issues. For example, your script may be attempting to add an out of stock item to a cart.

Handling failures is part of building a robust load test suite. Element provides a number of methods for this:

### Recovery steps

Recovery steps define an optional step which is called if a previous step fails, and can then perform a series of actions to return the application to a known state.

There are two types of recovery steps: global and local.

**Global recovery**
A global recovery step is executed in response to failures from any step in the script. This type of recovery step can be useful for application-wide error messages or alerts. Global recovery steps are executed only for steps without a local recovery step.

```diff title="my-test.perf.ts"
import { step } from "@flood/element";

export default () => {
  step("Step 1", async (browser) => {
   await browser.visit("https://google.com")
  })

+  step.recovery(async browser => {
+    let alertCloser = await browser.findElement(By.id("close"))
+    if (alertCloser!=null) await alertCloser.click()
+  })
};
```

**Local recovery**
A local recovery step is executed in response to a failure in a particular step only, and it does not apply to failures in other steps. A local recovery step takes precedence over a global recovery step.

```diff title="my-test.perf.ts"
import { step } from "@flood/element";

export default () => {
  step("Step 1", async (browser) => {
   await browser.visit("https://google.com")
  })

-  step.recovery(async browser => {
+  step.recovery("Step 1", async browser => {
+    let alertCloser = await browser.findElement(By.id("close"))
+    if (alertCloser!=null) await alertCloser.click()
+  })
};
```

**Recovery instructions**

Element offers the ability to control what happens after a step has been recovered. By returning one of these instructions, the test will change its course.

- `RecoverWith.RETRY`: Run the previous step again. Element will only do this up to the `recoveryTries` count, which is `1` by default. You can apply a general value for the whole test by putting this option within the `TestSettings`, or override this value for a specific step by putting it into the recovery step as in the code snippet below.
- `RecoverWith.CONTINUE`: Continue to the next step. This is the default behaviour.
- `RecoverWith.RESTART`: Exit this loop and restart the test at the beginning, resetting the browser in the process.

```ts title="my-test.perf.ts"
import { step } from '@flood/element'

export default () => {
	step('Step 1', async (browser) => {
		await browser.visit('https://google.com')
	})

	step.recovery('Step 1', { recoveryTries: 2 }, async (browser) => {
		let alertCloser = await browser.findElement(By.id('close'))
		if (alertCloser != null) await alertCloser.click()

		return RecoverWith.RETRY // retry "Step 1"
	})
}
```

### Try/Catch

Because Element scripts are in JavaScript, you can use any error handling you typically would in JS, including `try/catch` or `.catch(...)`.

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

### Which recovery method should you use

The best recovery method to use depends on whether you want the recovery time measured separately from the step you were testing.

Using `try/catch` will include the catch time in the total step time.
Using a recovery step will measure the time separately as "Step 1 (Recovery)".

## Conditional steps

Flood Element supports conditional execution. If you want to execute a specific chain of actions only when a condition is satisfied, you can do so using either `step.if()` or `step.unless()`.

### step.if()

Execute only when a condition is met.

```ts title="my-test.perf.ts"
import { step } from '@flood/element'

export default () => {
	step.if(condition, 'Step name', async (browser) => {
		// do something
	})
}
```

### step.unless()

Execute only when the opposite of a condition is met.

```ts title="my-test.perf.ts"
import { step } from '@flood/element'

export default () => {
	step.unless(condition, 'Step name', async (browser) => {
		// do something
	})
}
```

## Repeatable steps

To repeat a step a certain number of times or while a condition is still true, use `step.repeat()` or `step.while()`.

### step.repeat()

Repeat a step for a predefined number of times.

```ts title="my-test.perf.ts"
import { step } from '@flood/element'

export default () => {
	step.repeat(number, 'Step name', async (browser) => {
		// do something
	})
}
```

### step.while()

Repeat a step while a condition is true.

```ts title="my-test.perf.ts"
import { step } from '@flood/element'

export default () => {
	step.while(condition, 'Step name', async (browser) => {
		// do something
	})
}
```

## Run a step once

Run a step only once in the whole test regardless of the number of iterations. This can be used to create setup and teardown steps. For example, you can run an authentication step at the start of the test and a logout step at the end.


### step.once()

```ts title="my-test.perf.ts"
import { step } from '@flood/element'

export default () => {
	step.once('Step name', async (browser) => {
		// do something
	})
}
```

## Mark a step as `skipped`

Skip the execution of a step in your test. Skipping a step is a little like commenting it out, but the step will be shown in the execution as skipped.

### step.skip()

```ts title="my-test.perf.ts"
import { step } from '@flood/element'

export default () => {
	step.skip('Step name', async (browser) => {
		// do something
	})
}
```
