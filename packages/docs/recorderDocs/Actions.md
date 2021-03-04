---
id: actions
title: Supported actions
---

Actions are units that comprise a test scenario. There are two categories of actions:

* **Browser interactions:** actions simulating user interactions and can be recorded by interacting with the browser.

* **Programming actions:** actions to be used for programming purposes, cannot be recorded by interacting with the browser but added from Recorder menus.

## Browser interactions

*You should go through the general guide for [recording browser interactions][record-actions] and [editing actions][edit-actions] before reading further for specific details of each action.*

### `CLICK`

Click on an element of the page.

- **Editable:** Yes

- **Action type:** Can be changed to `DBCLICK`

- **Action-specic fields:**

  - **Target element:** Element to click on. This can be changed to any visible elements on the page.

### `DBCLICK`

Click on an element of the page.

- **Editable:** Yes

- **Action type:** Can be changed to `CLICK`

- **Action-specic fields:**

  - **Target element:** Element to double click on. This can be changed to any visible elements on the page.

### `DRAG`

Drag and drop an element on the page.

- **Editable:** Yes

- **Action type:** Cannot be changed

- **Action-specic fields:**

  - **Target element:** Element to double click on. This can be changed to any visible elements on the page.
  - **Original coordinates:** `number` The "from" horizontal and vertical coordinate in pixel of the element (not editable).
  - **Destination coordinates:** `number` The "to" horizontal and vertical coordinate in pixel of the element (editable).

### `DRAG-SELECT`

Drag to select a string of text on the page.

- **Editable:** No

If you'd like to change the selected text, you'll need to drag-select the new text on the page and remove the old action.

### `HOVER`

Hover on an element on the page.

To record a hover action, press and hold the right Shift, then hover on the target element and release the right Shift. You can turn this on/off in the [Recorder settings][recorder-settings-hover].

- **Editable:** Yes

- **Action type:** Can not be changed

- **Action-specic fields:**

  - **Target element:** Element to hover on. This can be changed to any visible elements on the page.

### `NAVIGATE`

Navigate to the target web page.

This action is the first action in a scenario. It is auto-recorded when you open the target web page and launch the Recorder. You can edit the URL right in the action on the Recording screen.

### `PRESS`

Press a single key or a key combination (eg: `Ctrl + C` on Windows or `Cmd + C` on MacOS) on your keyboard.

- **Editable:** Yes

- **Action type:** Cannot be changed

- **Action-specic fields:**

  - **Key(s) to press:** Click `Change` and press the new key or key combination to change.

### `RESIZE`

Resize the viewport (or the browser windows).

- **Editable:** Yes

- **Action type:** Cannot be changed

- **Action-specic fields:**

  - **Viewport width:** `number` The width of the viewport in pixel after resizing.
  - **Viewport height:** `number` The height of the viewport in pixel after resizing.

### `SCROLL`

Scroll the web page up or down to a coordinate.

- **Editable:** Yes

- **Action type:** Can not be changed

- **Action-specic fields:**

  - **Horizontal distance to scroll:** `number` The horizontal coordinate in pixel to scroll to.
  - **Vertical distance to scroll:** `number` The vertical coordinate in pixel to scroll to.

### `SELECT`

Select an item in a dropdown list.

- **Editable:** Yes

- **Action type:** Can not be changed

- **Action-specic fields:**

  - **Target element:** The dropdown list to select an item from. This can be changed to any dropdown lists on the page.
  - **Selected value:** `string` or `number` Value of the item to select.

### `TYPE`

Type a string of text to a textbox or a text area.

- **Editable:** Yes

- **Action type:** Can not be changed

- **Action-specic fields:**

  - **Target element:** The text area to type into. This can be changed to any text areas on the page.
  - **Value to type:** `string`, `number` or `bool` String of text to type.

## Programming actions

### `ASSERT`

See [Work with assertions][assert].

### `CREATE`

See [Work with variables][variable].

### `TAKE`

See [Add take screenshot][take].

### `WAIT`

See [Add wait][wait].

[record-actions]: ./record#start-recording
[edit-actions]: ./record#edit-an-action
[recorder-settings-hover]: ./settings#record-hover-actions-hold-right-shift
[assert]: ./assert
[variable]: ./variables
[take]: ./record#add-take-screenshot
[wait]: ./record#add-wait
