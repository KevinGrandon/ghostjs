# ghostjs - Modern web integration test runner

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
* ghostjs.screenshot() - Saves a screenshot to the screenshots/ folder.
* ghostjs.findElement(selector) - Returns an element instance of this selector.
* await element.getAttribute(attribute) - Returns the value of an attribute for this element
* await element.html() - Returns the innerHTML of an element.
* await element.text() - Returns the textContent of an element.


## Example Test

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
  })
})


```
