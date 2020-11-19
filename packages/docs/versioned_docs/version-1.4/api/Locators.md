---
id: locators
title: Locators
---

Locators are used to describe an element or elements you want to interact with on a page.

# `By`

By is used to create [Locators][locator] to find Elements or use in any place which accepts a Locator or [Locatable][].

## Methods

### `By.attr(tagName, attrName, attrValue)`

Locates an element where the attribute matches the value.

**Example:**

```typescript
By.attr("name", "frame-name");
```

**Parameters**

- tagName `string`
- attrName `string`
- attrValue `string`
- returns: [`Locator`][locator]

### `By.css(selector[, debugString])`

Locates an element using a CSS (jQuery) style selector.

This locator is implemented using `document.querySelector` on the page.

**Parameters**

- selector `string`
- debugString? `string` (Optional)
- returns: [`Locator`][locator]

### `By.id(id)`

Locates elements by the ID attribute. This locator uses the CSS selector
`*[id="$ID"]`, _not_ `document.getElementById`.

**Parameters**

- id `string` The ID to search for
- returns: [`Locator`][locator]

### `By.js(script, ...args)`

Locates an elements by evaluating a JavaScript expression.
The result of this expression must be an element or list of elements.

**Parameters**

- script [`EvaluateFn`][evaluatefn] The script to execute.
- args `any`\[]
- returns: [`Locator`][locator]

### `By.linkText(text)`

Locates link elements whose `textContent` matches the given
string.

**Parameters**

- text `string` The link text to search for.
- returns: [`Locator`][locator]

### `By.nameAttr(value)`

Locates elements whose `name` attribute has the given value.

**Parameters**

- value `string` The name attribute to search for.
- returns: [`Locator`][locator]

### `By.partialLinkText(text)`

Locates link elements whose `textContent` contains the given
substring.

**Parameters**

- text `string` The substring to check for in a link's visible text.
- returns: [`Locator`][locator]

### `By.partialVisibleText(text)`

Locates all elements whose `textContent` contains the given
substring and is not hidden by CSS.

**Parameters**

- text `string` The substring to check for in a elements's visible text.
- returns: [`Locator`][locator]

### `By.tagName(name)`

Locates elements with a given tag name.

**Parameters**

- name `string` The tag name to search for.
- returns: [`Locator`][locator]

### `By.visibleText(text)`

Locates all elements whose `textContent` equals the given
substring and is not hidden by CSS.

**Parameters**

- text `string` The string to check for in a elements's visible text.
- returns: [`Locator`][locator]

### `By.xpath(xpath)`

Locates elements matching a [XPath][] selector.

**Parameters**

- xpath `string` The XPath selector to use.
- returns: [`Locator`][locator]

**Properties**

- args `string`\[]
- command `string`

# `Locator`

A Locator represents an object used to locate elements on the page. It is usually constructed using the helper methods of [By][].
An [ElementHandle][] can also be used as a Locator which finds itself.

[locator]: Locators
[locatable]: api/browser
[locator]: Locators

[EvaluateFn]: [evaluate]

[by]: Locators
[elementhandle]: element-handle
