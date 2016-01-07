# ghostjs - Modern web integration test runner

[![Build Status](https://travis-ci.org/KevinGrandon/ghostjs.svg?branch=master)](https://travis-ci.org/KevinGrandon/ghostjs)

Typical integration test frameworks are a nightmare of callbacks and arbitrary chaining syntax. Ghostjs uses standardized ES7 async functions in order to create a syntax that's extremely easy to reason about and work with. Take a look at our API and an example test case below. Ghostjs currently runs on PhantomJS, with support for SlimerJS coming soon.

## Installation

```
npm install ghostjs
```

## API

* await ghost.open(url) - Instantiates ghostjs and opens a webpage
* await ghost.countElements(selector) - Counts the number of elements in the dom for this selector.
* await ghost.findElement(selector) - Returns an element instance of this selector.
* await ghost.screenshot(filename?, folder?) - Saves a screenshot to the screenshots/ folder.
* await ghost.script(func) - Executes a script within a page and returns the result of that function.
* await ghost.wait(ms) - Waits for an arbitrary amount of time. It's typicall better to wait for elements or dom state instead.
* await ghost.waitForElement(selector) - Waits for an element to exist in the page, and returns it.
* await ghost.waitForPageTitle(string|RegExp) - Waits for the page title to match the expected value.
* await ghost.waitFor(function, pollMs?) - Polls until the return result of the function is true.
* await element.click(x?, y?) - Clicks the element, by default in the center of the element.
* await element.getAttribute(attribute) - Returns the value of an attribute for this element
* await element.html() - Returns the innerHTML of an element.
* await element.fill(text) - Sets a form field to the provided value. Tries setting the right value for non-text inputs.
* await element.isVisible() - Checks whether or not the element is visible.
* await element.mouse(type, x?, y?) - Dispatches a mouse of event of the given type to the element.
* await element.rect() - Returns the current coordinates and sizing information of the element.
* await element.text() - Returns the textContent of an element.
* await element.script(func) - Executes a function on the page which receives the DOM element as the first argument.

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

## Dependencies

### PhantomJS

By default ghostjs will use PhantomJS as a test runner. You will need phantomjs installed and available in your PATH somewhere. Make sure this works:
```
$ phantomjs
```

You can get phantomjs here: http://phantomjs.org/download.html

We are currently working on slimerjs support and hope to be able to run with either in the near future. See issue #10.

### Babel

Since we're using bleeding edge javascript /w async functions we currently recommend that you use babel to run your tests. At a minimum you should install these packages:
```
npm install babel-preset-es2015 --save-dev
npm install babel-preset-stage-0 --save-dev
```

In a file named `.babelrc`:
```
{
  "presets": ["es2015", "stage-0"]
}

```
