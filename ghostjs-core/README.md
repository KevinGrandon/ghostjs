# ghostjs - Modern web integration test runner

[![npm version](https://badge.fury.io/js/ghostjs.svg)](https://badge.fury.io/js/ghostjs)
[![Build Status](https://travis-ci.org/KevinGrandon/ghostjs.svg?branch=master)](https://travis-ci.org/KevinGrandon/ghostjs)
[![Dependency Status](https://david-dm.org/kevingrandon/ghostjs.svg?path=/ghostjs-core/)](https://david-dm.org/kevingrandon/ghostjs?path=/ghostjs-core/)

Typical integration test frameworks are a nightmare of callbacks and arbitrary chaining syntax. Ghostjs uses standardized ES7 async functions in order to create a syntax that's extremely easy to reason about and work with. Take a look at our API and an example test case below. Ghostjs currently runs on both Chrome, Firefox (through SlimerJS), and Phantom.

## Installation

```
npm install ghostjs
```

## API

* `ghost.injectScripts(path)` - Injects scripts into the webpage.
* `ghost.setDriverOpts(opts)` - Sets driver options. You can find a list of supported options [here](http://phantomjs.org/api/command-line.html).
* `await ghost.open(url, options={headers={}, settings:{}, viewportSize:{}})` - Instantiates ghostjs and opens a webpage
* `await ghost.findElement(selector)` - Returns an element instance of this selector.
* `await ghost.findElements(selector)` - Returns an array of element instances that match the given selector.
* `ghost.goBack()` - Navigates back in history one page.
* `ghost.goForward()` - Navigates forward in history one page.
* `await ghost.screenshot(filename?, folder?)` - Saves a screenshot to the screenshots/ folder.
* `await ghost.script(func, [args]?)` - Executes a script within a page and returns the result of that function.
* `await ghost.usePage(string)` - Uses a page as a context to script. E.g., a url from window.open. Pass null to switch back to the main page.
* `await ghost.wait(ms)` - Waits for an arbitrary amount of time. It's typicall better to wait for elements or dom state instead.
* `await ghost.wait(func)` - Waits until the return condition of the passed in function is met. Polls continuously until a return condition is true.
* `await ghost.waitForElement(selector)` - Waits for an element to exist in the page, and returns it.
* `await ghost.waitForElementNotVisible(selector)` - Waits for an element to be hidden or inexistent in the dom.
* `await ghost.waitForElementVisible(selector)` - Waits for an element to exist and be visible on the page.
* `await ghost.waitForPage(string)` - Waits for the a page to be opened opened with the given url (or string search), via window.open.
* `await ghost.waitForPageTitle(string|RegExp)` - Waits for the page title to match the expected value.
* `await ghost.click(selector)` - Clicks on an element specified by the selector, by default in the center of the element.
* `await ghost.fill(selector, text)` - Fills a form field with the provided value. Tries to set the right value for non-text inputs.
* `await element.click(x?, y?)` - Clicks the element, by default in the center of the element.
* `await element.getAttribute(attribute)` - Returns the value of an attribute for this element
* `await element.html()` - Returns the innerHTML of an element.
* `await element.file(path)` - Sets a file input to a file on disk.
* `await element.fill(text)` - Sets a form field to the provided value. Tries setting the right value for non-text inputs.
* `await element.isVisible()` - Checks whether or not the element is visible.
* `await element.mouse(type, x?, y?)` - Dispatches a mouse of event of the given type to the element.
* `await element.rect()` - Returns the current coordinates and sizing information of the element.
* `await element.text()` - Returns the textContent of an element.
* `await element.script(func, [args]?)` - Executes a function on the page which receives the DOM element as the first argument.

## Usage

### Example Test

```js
import ghost from 'ghostjs'
import assert from 'assert'

describe('Google', () => {
  it('has some content', async () => {
    await ghost.open('http://google.com')
    let pageTitle = await ghost.pageTitle()
    assert.equal(pageTitle, 'Google')

    // Get the content of the body
    let body = await ghost.findElement('body')
    assert.ok(await body.isVisible())
    console.log('got body content', await body.html())

    // Wait for the first link and click it
    let firstLink = await ghost.waitForElement('a')
    firstLink.click()
  })
})

```

### Waiting for a DOM Condition

```js
await ghost.open(myUrl)
var hasMoved = await ghost.waitFor(async () => {
  var el = await ghost.findElement('.someSelector')
  var rect = await el.rect()
  return rect.left > 100
})
assert.equal(hasMoved, true)
```

### Chaining and promises

```js
// The recommended way to get element text:
let el = await ghost.waitForElement(selector)
let text = await el.text()
console.log(text)

// If you're looking for something slightly less verbose, you can also chain with .then():
let text = await ghost.waitForElement(selector).then( async el => el.text() )
console.log(text)
```

## Dependencies

### Chrome

By default ghostjs will use Chrome as a test runner, or when you pass `--browser chrome` as a command line argument. You will need to have chrome installed on your machine, but ghostjs will try to automatically locate the binary. You can specify a CHROME_BIN env var to override this location.

You can also set flags that you'd like to specify to the chrome binary by setting the CHROME_FLAGS env variable, separated by commas:
```
CHROME_FLAGS=--disable-gpu,--force-text-direction=RTL ghostjs --browser chrome test/*.js
```

### PhantomJS

You can choose to test on PhantomJS as a test runner by passing the `--browser phantom` option to the `ghostjs` command. PhantomJS is installed as a dependency of the `ghostjs` package. E.g., you may have the following in your package.json:
```
"scripts": {
  "test": "ghostjs --browser phantom test/*.js"  
}
```

### Firefox

You can choose to test on Firefox (through SlimerJS) as a test runner by passing the `--browser firefox` option to the `ghostjs` command. Firefox must be installed on your computer to run tests against Firefox. E.g., you may have the following in your package.json:
```
"scripts": {
  "test": "ghostjs --browser firefox test/*.js"  
}
```

Note: SlimerJS is not headless and requires a windowing environment to run. If you are trying to run SlimerJS on travis, you can modify your travis.yml to have the following:
```yml
before_script:
  - export DISPLAY=:99.0
  - "sh -e /etc/init.d/xvfb start"
```

You can see how we run both Chrome, Firefox and PhantomJS tests in our example [package.json](https://github.com/KevinGrandon/ghostjs/blob/0bccf322b440f742b5c9e0e99ad39bcd19e5a853/ghostjs-examples/package.json#L8-L9) and our [.travis.yml](https://github.com/KevinGrandon/ghostjs/blob/79a2d070e3b5b20c1b25cc49828e9bf6941dec58/.travis.yml#L7-L10)


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

### Verbose Logs

You can output verbose website information like console.log statements and errors by using the `--verbose` flag. E.g, `ghostjs ./test/mytest.js --verbose`.


### Slimer JSConsole

The Slimer JSConsole can be very useful when debugging tests. There are two ways to open the console, one inside a test with:
```
ghost.setDriverOpts({parameters: ['-jsconsole']})
```

You can also pass an environment variable to enable the console:
```
GHOST_CONSOLE=1 ./node_modules/.bin/ghostjs
```

### Page Options

onResourceRequested - Pass a custom function to execute whenever a resource is requested.

### Network throttling (only in Chrome)

networkOptions: ghost.networkTypes['offline'|'gprs'|'regular2g'|'good2g'|'regular3g'|'good3g'|'regular4g|'dsl'|'wifi']

As of v1.11.0, Ghost supports network throttling for loading pages. This feature is only available when run with the `--browser=chrome` flag. 

With network throttling, you can simulate running your tests with a variety of connections. These connections are exposed in Ghost under `ghost.networkTypes`, and represent the latency, download, and upload speeds that are found in the Chrome devtools.

## Contributors

Please see: [CONTRIBUTING.md](https://github.com/KevinGrandon/ghostjs/blob/master/CONTRIBUTING.md)
