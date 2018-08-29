---
title: ''
---
# `By`

By is used to create <[Locator]>s to find Elements or use in any place which accepts a Locator or <[Locatable]>.

#### `by.attr(tagName, attrName, attrValue)`
* `tagName` &lt;string&gt;  
* `attrName` &lt;string&gt;  
* `attrValue` &lt;string&gt;  
* returns: &lt;[Locator]&gt; 

Locates an element where the attribute matches the value.

**Example:**
By.attr('name', 'frame-name')

#### `by.css(selector[, debugString])`
* `selector` &lt;string&gt;  

* `debugString` &lt;undefined|string&gt; (Optional) 
* returns: &lt;[Locator]&gt; 

Locates an element using a CSS (jQuery) style selector

#### `by.id(id)`
* `id` &lt;string&gt;  The ID to search for

* returns: &lt;[Locator]&gt; 

Locates elements by the ID attribute. This locator uses the CSS selector
`*[id="$ID"]`, _not_ `document.getElementById`.

#### `by.js(script, args)`
* `script` &lt;[EvaluateFn]&gt;  The script to execute.
* `args` &lt;any[]&gt;  
* returns: &lt;[Locator]&gt; 

Locates an elements by evaluating a JavaScript expression.
The result of this expression must be an element or list of elements.

#### `by.linkText(text)`
* `text` &lt;any&gt;  The link text to search for.

* returns: &lt;[Locator]&gt; 

Locates link elements whose `textContent` matches the given
string.

#### `by.nameAttr(value)`
* `value` &lt;string&gt;  The name attribute to search for.
* returns: &lt;[Locator]&gt; 

Locates elements whose `name` attribute has the given value.

#### `by.partialLinkText(text)`
* `text` &lt;any&gt;  The substring to check for in a link's visible text.

* returns: &lt;[Locator]&gt; 

Locates link elements whose `textContent` contains the given
substring.

#### `by.partialVisibleText(text)`
* `text` &lt;string&gt;  The substring to check for in a elements's visible text.

* returns: &lt;[Locator]&gt; 

Locates all elements whose `textContent` contains the given
substring and is not hidden by CSS.

#### `by.tagName(name)`
* `name` &lt;string&gt;  The tag name to search for.
* returns: &lt;[Locator]&gt; 

Locates elements with a given tag name.

#### `by.visibleText(text)`
* `text` &lt;string&gt;  The string to check for in a elements's visible text.

* returns: &lt;[Locator]&gt; 

Locates all elements whose `textContent` equals the given
substring and is not hidden by CSS.

#### `by.xpath(xpath)`
* `xpath` &lt;any&gt;  The XPath selector to use.
* returns: &lt;[Locator]&gt; 

Locates elements matching a XPath selector. Care should be taken when
using an XPath selector with a {@link webdriver.WebElement} as WebDriver
will respect the context in the specified in the selector. For example,
given the selector `//div`, WebDriver will search from the document root
regardless of whether the locator was used with a WebElement.

* `args` &lt;string[]&gt;      
* `command` &lt;string&gt;      
# `Locator`

A Locator represents an object used to locate elements on the page. It is usually constructed using the helper methods of <[By]>.
An <[ElementHandle]> can also be used as a Locator which finds itself.


[Locator]: ../../api/By.md#locator
[EvaluateFn]: ../..#evaluatefn
[By]: ../../api/By.md#by

[Locator]: ../../api/By.md#locator