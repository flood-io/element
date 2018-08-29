---
title: Examples - Test Data Generation
---

# Examples - Test Data Generation

## Overview

With the help of the incredible open-source Faker library [Faker.js](https://github.com/Marak/faker.js) - we can generate test data for use in Flood Element test very easily and on-the-fly. The Faker library allows us to generate a wide variety of syntax-correct data such as randome names, numbers, strings, emails etc.

To start using Faker within your Flood Element script you will need to import the specific Faker library -for example for basic random data - we would use the following 'random' library:

```typescript
    import { random } from 'faker'
```

## Generating Random Numbers

The simplest way to generate a random number using Faker is to declare the 'random' Faker object at the top of your Flood Element script and then use the following in your Flood Element script step to generate a 5 digit random number between 0 and 99999:

```typescript
        //Generate a random phone number
        var randNumber = random.number(99999).toString()
```

## Generating Person Names

You are able to generate random first and surnames very easily:

```typescript
    //put this import statement at the top of your script
    import { name } from 'faker'
```

```typescript
        //Generate different types of names and related data
        var randFirstname = name.firstName()
        var randSurname = name.lastName()
        var randJobTitle = name.jobTitle()
        var randPrefix = name.prefix()
```

## Generating Email Addresses

You are able to generate email addresses and other web related test data using the following:

```typescript
    //put this import statement at the top of your script
    import { internet } from 'faker'
```

```typescript
        //Generate different types of names and related data
        var randEmail = internet.email() ////returns "Timmy_Pacocha@gmail.com"
        var randEmailProvider = internet.email("joe","smith","protonmail.com") //returns "joe.smith@protonmail.com"
```































































































































































