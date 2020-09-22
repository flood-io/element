---
id: hook
title: Setup and Teardown
---

Often while writing tests you have some setup work that needs to happen before tests run, and you have some finishing work that needs to happen after tests run. Flood Element provides helper functions to handle this.

## Setup
### beforeAll()
Some setups need to be done before the main test begins, as a pre-condition. For example, you are going to test a web app, and in order to perform the main steps, you need to be authenticated first. In that case, you can do the authentication within `beforeAll()`.

```ts title="beforeAll-test.perf.ts"
import { step, beforeAll } from "@flood/element";

export default () => {
  beforeAll(async browser => {
    // your login code
  })
  
  step("Step 1", async () => {
    ...
  })

  step("Step 2", async () => {
    ...
  })

};
```
### beforeEach()
For the setup that needs to be repeated before each step, you can put it inside `beforeEach()`

```ts title="beforeEach-test.perf.ts"
import { step, beforeEach } from "@flood/element";

export default () => {
  beforeEach(async browser => {
    // your repeated setup code
  })
  
  step("Step 1", async () => {
    ...
  })

  step("Step 2", async () => {
    ...
  })

};
```

## Teardown
### afterEach()
Sometimes, to avoid trash data while testing on production environment, you need to do the cleaning after each step. In that case, use `afterEach()`.
```ts title="afterEach-test.perf.ts"
import { step, afterEach } from "@flood/element";

export default () => {
  afterEach(async browser => {
    // your repeated cleaning code
  })
  
  step("Step 1", async () => {
    ...
  })

  step("Step 2", async () => {
    ...
  })

};
```
### afterAll()
After the main steps have finished, you may want to do the final cleaning work, or simply just log out to kill the session. `afterAll()` is a good choice for this.
```ts title="afterAll-test.perf.ts"
import { step, afterAll } from "@flood/element";

export default () => {
  afterAll(async browser => {
    // your final cleaning code
  })
  
  step("Step 1", async () => {
    ...
  })

  step("Step 2", async () => {
    ...
  })

};
```
## Order of execution
As long as `before*` and `after*` handlers are put inside the default test suite, they will be executed in the following order, regardless of where you put them inside the suite: 
1. `beforeAll()` 
2. `beforeEach()`
3. Your test `step()`
4. `afterEach()`
5. `afterAll()`

Take the following code snippet as an example:
```ts title="executionOrder-test.perf.ts"
import { TestSettings, step, afterAll, afterEach, beforeAll, beforeEach } from '@flood/element'

export default () => {
	beforeAll(async browser => {
		console.log('BeforeAll is running')
	})

	beforeEach(async () => {
		console.log('BeforeEach is running')
	})

	step('Step 1', async browser => {
		console.log('The first step is running')
	})

	step('Step 2', async browser => {
		console.log('The second step is running')
	})

	afterEach(async () => {
		console.log('AfterEach is running')
	})

	afterAll(async () => {
		console.log('AfterAll is running')
	})
}

```
The output of the above code should be:

```shell
BeforeAll is running

BeforeEach is running
The first step is running
AfterEach is running

BeforeEach is running
The second step is running
AfterEach is running

AfterAll is running
```
:::info
In case you have more than 1 `beforeAll()` in your test script, they will be executed sequentially from top to down. Similarly for `beforeEach()`, `afterEach()` and `afterAll()`.
:::