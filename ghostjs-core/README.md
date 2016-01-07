# ghostjs - Modern web integration test runner

[![Build Status](https://travis-ci.org/KevinGrandon/ghostjs.svg?branch=master)](https://travis-ci.org/KevinGrandon/ghostjs)

## Installation

```
npm install ghostjs
```


## Using PhantomJS

By default ghostjs will use PhantomJS as a test runner. You will need phantomjs installed and available in your PATH somewhere. Make sure this works:
```
$ phantomjs
```

You can get phantomjs here: http://phantomjs.org/download.html


## API

* await ghost.js.open(url) - Instantiates ghostjs and opens a webpage
* await ghostjs.countElements(selector) - Counts the number of elements in the dom for this selector.
* await ghostjs.findElement(selector) - Returns an element instance of this selector.
* await ghostjs.screenshot(filename?, folder?) - Saves a screenshot to the screenshots/ folder.
* await ghostjs.waitForElement(selector) - Waits for an element to exist in the page, and returns it.
* await ghostjs.waitFor(function, pollMs?) - Polls until the return result of the function is true.
* await element.click(x?, y?) - Clicks the element, by default in the center of the element.
* await element.getAttribute(attribute) - Returns the value of an attribute for this element
* await element.html() - Returns the innerHTML of an element.
* await element.mouse(type, x?, y?) - Dispatches a mouse of event of the given type to the element.
* await element.text() - Returns the textContent of an element.
* await element.isVisible() - Checks whether or not the element is visible.
* await element.scriptWith(func) - Executes a function which receives the DOM element as the first argument.

## Usage

### Example Test

```js

import ghost from 'ghostjs'
import assert from 'assert'

describe('Google', () => {
  it('has a title', async () => {
    await ghost.open('http://google.com')
    let pageTitle = await ghost.pageTitle()
    assert.equal(pageTitle, 'Google')

    // Get the content of the body
    let body = ghost.findElement('body')
    console.log(await body.html())

    assert.isTrue(await body.isVisible());
  })
})

```

### Waiting for a DOM Condition

```js
await ghost.open(myUrl)
var isVisible = await ghost.waitFor(async () => {
  var findEl = ghost.findElement('.someSelector')
  return await findEl.isVisible()
})
assert.equal(isVisible, true)
```
