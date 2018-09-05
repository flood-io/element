---
title: Examples - Test Data Generation
---

# Examples - Test Data Generation

## Overview

The highly capable open-source Faker library [Faker.js](https://github.com/Marak/faker.js) makes it simple to add rich, unique, on-the-fly test data to your scripts.
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

## Further reading

For more information about what Faker can do for you, please consult the [Faker API Documentation](https://github.com/Marak/faker.js#api)

If you have static test data available as CSV or JSON files, consider using Flood Element's [TestData](./examples_test_data.md) facility.

<!-- suffix -->

[TestData]: ../../api/TestData.md#testdata