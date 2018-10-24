---
title: Examples - Test Data Generation
---

# Examples - Test Data Generation

## Overview

Sometimes you want to generate random data that seem realistic. For this we bundle the highly capable open-source Faker library [Faker.js](https://github.com/Marak/faker.js) which makes it simple to add rich, unique, on-the-fly test data to your scripts.
The Faker library allows us to generate a wide variety of syntax-correct data such as random names, numbers, strings and emails.

To start using Faker within your Flood Element script you will need to import the part of the Faker library you'd like to make us of.
For example, for basic random data we would use import `random` at the top of the script:

```typescript
import { random } from 'faker'
```

## Generating Random Numbers

The simplest way to generate a random number using Faker is to import the `random` Faker object at the top of your Flood Element script and then use it as follows:

```typescript
var randNumber = random.number(99999).toString()
```

This example generates a 5 digit random number between 0 and 99999.

## Generating Person Names

Generating random first and surnames is just as easy, using the `name` object:

```typescript
// put this import statement at the top of your script
import { name } from 'faker'

// Generate different types of names and related data
var randFirstname = name.firstName()
var randSurname = name.lastName()
const randJobTitle = name.jobTitle()
const randPrefix = name.prefix()
```

## Generating Email Addresses and other Web Data

To generate email addresses and other web related test data, use `internet`:

```typescript
// put this import statement at the top of your script
import { internet } from 'faker'

// Generate different types of names and related data
const randEmail = internet.email() // returns "Timmy_Pacocha@gmail.com"
const randEmailProvider = internet.email("joe","smith","protonmail.com") // returns "joe.smith@protonmail.com"
```

## Using fake data in tests

Once you have generated some data with Faker, Flood Element's [TestData](./examples_test_data.md) facility makes it available in your test steps.

```typescript
import { name, internet } from 'faker'

interface UserData {
  firstName: string,
  lastName: string,
  email: string,
}

// generate a fake User
const userFactory = () => <UserData>({
  firstName: name.firstName(),
  lastName: name.lastName(),
  email: internet.email(),
})

// create 5 fake users
const data = Array.from({ length: 5 }, userFactory)

// load generated data into the test
TestData.fromData<UserData>(data)
```

This example generates 5 random users with realistic data, and makes them available in the test steps. One `UserData` record will be provided to the steps per test iteration.

```typescript
step('Step 1', (browser: Browser, user: UserData) => {
  // test your page using the fake user data for this iteration
})
```

## Further reading

For more information about what Faker can do for you, please consult the [Faker API Documentation](https://github.com/Marak/faker.js#api)

If you have static test data available as CSV or JSON files, consider using Flood Element's [TestData](./examples_test_data.md) facility.

<!-- suffix -->

[TestData]: ../../api/TestData.md#testdata
