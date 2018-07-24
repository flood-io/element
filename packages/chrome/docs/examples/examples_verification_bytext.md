---
title: Examples - Verification - By Text
---

# Examples - Verification - By Text

## Using complete strings

The easiest way to verify that a resulting page has been load successfully is to check some static text value that you know will apear once the page is loaded.

```typescript
await browser.wait(Until.elementIsVisible(By.visibleText('Resulting page text here')))
```
We can use the *browser.wait* command along with the *By.visibleText* option containing the static text we would like to validate against.

Or, you are able to use a simple text verification over 2 statements as follows:

```typescript
		let pageTextVerify = By.visibleText('Welcome to')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
```

## Using partial strings

You are also able to validate a resulting page using partial strings - as follows:

```typescript
		let pageTextVerify = By.partialVisibleText('Welcome to')
		await browser.wait(Until.elementIsVisible(pageTextVerify))
```

