---
title: ''
---

# By

By is used to create &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt;s to find Elements or use in any place which accepts a Locator or &lt;[Locatable](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/Browser.md#locatable)&gt;.

### methods

### `By.attr(tagName, attrName, attrValue)`

* `tagName` &lt;string&gt;   
* `attrName` &lt;string&gt;   
* `attrValue` &lt;string&gt;   
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt; 

Locates an element where the attribute matches the value.

**Example:** By.attr\('name', 'frame-name'\)

### `By.css(selector[, debugString])`

* `selector` &lt;string&gt;
* `debugString` &lt;undefined \| string&gt; \(Optional\)
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt; 

Locates an element using a CSS \(jQuery\) style selector

### `By.id(id)`

* `id` &lt;string&gt; The ID to search for
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt;

Locates elements by the ID attribute. This locator uses the CSS selector `*[id="$ID"]`, _not_ `document.getElementById`.

### `By.js(script, args)`

* `script` &lt;[EvaluateFn](../../#evaluatefn)&gt;   The script to execute.
* `args` &lt;any\[\]&gt;   
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt; 

Locates an elements by evaluating a JavaScript expression. The result of this expression must be an element or list of elements.

### `By.linkText(text)`

* `text` &lt;string&gt; The link text to search for.
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt;

Locates link elements whose `textContent` matches the given string.

### `By.nameAttr(value)`

* `value` &lt;string&gt;   The name attribute to search for.
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt; 

Locates elements whose `name` attribute has the given value.

### `By.partialLinkText(text)`

* `text` &lt;string&gt; The substring to check for in a link's visible text.
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt;

Locates link elements whose `textContent` contains the given substring.

### `By.partialVisibleText(text)`

* `text` &lt;string&gt; The substring to check for in a elements's visible text.
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt;

Locates all elements whose `textContent` contains the given substring and is not hidden by CSS.

### `By.tagName(name)`

* `name` &lt;string&gt;   The tag name to search for.
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt; 

Locates elements with a given tag name.

### `By.visibleText(text)`

* `text` &lt;string&gt; The string to check for in a elements's visible text.
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt;

Locates all elements whose `textContent` equals the given substring and is not hidden by CSS.

### `By.xpath(xpath)`

* `xpath` &lt;string&gt;   The XPath selector to use.
* returns: &lt;[Locator](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#locator)&gt; 

Locates elements matching a XPath selector. Care should be taken when using an XPath selector with a {@link webdriver.WebElement} as WebDriver will respect the context in the specified in the selector. For example, given the selector `//div`, WebDriver will search from the document root regardless of whether the locator was used with a WebElement.

### properties

* `args` &lt;string\[\]&gt;       
* `command` &lt;string&gt;       

  **`Locator`**

A Locator represents an object used to locate elements on the page. It is usually constructed using the helper methods of &lt;[By](https://github.com/flood-io/element/tree/f4aa19ffab79b8eded0c80d05aa9e970f650f8ab/packages/element/api/By.md#by)&gt;. An &lt;\[ElementHandle\]&gt; can also be used as a Locator which finds itself.

\[ElementHandle\]: ../../api/ElementHandle.md\#elementhandle

