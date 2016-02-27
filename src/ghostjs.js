var driver = require('node-phantom-simple')

var argv = require('yargs').argv
import Element from './element';

class Ghost {
  constructor () {
    this.page = null
    this.childPages = []
    this.clientScripts = []
  }

  /**
   * Adds scripts to be injected to for each page load.
   * Should be called before ghost#open.
   */
  injectScripts () {
    Array.slice(arguments).forEach(script => {
      this.clientScripts.push(script)
    })
  }

  /**
   * Callback when a page loads.
   * Injects javascript and other things we need.
   */
  onOpen () {
    // Inject any client scripts
    this.clientScripts.forEach(script => {
      this.page.injectJs(script)
    })
  }

  async open (url) {
    // If we already have a page object, just navigate it.
    if (this.page) {
      return new Promise(resolve => {
        this.page.open(url, (err, status) => {
          this.onOpen()
          resolve(status)
        })
      })
    }

  	return new Promise(resolve => {
      let testRunner = argv['ghost-runner'] || 'phantomjs'

      driver.create({ path: require(testRunner).path }, (err, browser) => {
        this.browser = browser
        browser.createPage((err, page) => {
          this.page = page;

          page.onPageCreated = (page) => {
            var pageObj = {
              page: page,
              url: null
            }
            this.childPages.push(pageObj)
            page.onUrlChanged = (url) => {
              pageObj.url = url;
            };
          }

          page.onConsoleMessage = (msg) => {
            if (argv['verbose']) {
              console.log('[Console]', msg)
            }
          }

          page.open(url, (err, status) => {
            this.onOpen()
            resolve(status)
          })
        })
      },
      {
        // The dnode `weak` dependency is failing to install on travis.
        // Disable this for now until someone needs it.
        dnodeOpts: {
          weak: false
        }
      })
    })
  }

  async exit () {
    this.browser.exit();
  }

  goBack () {
    this.page.goBack()
  }

  goForward () {
    this.page.goForward()
  }

  screenshot (filename, folder='screenshots') {
    filename = filename || 'screenshot-' + Date.now()
    this.page.render(`${folder}/${filename}.png`)
  }

  /**
   * Returns the title of the current page.
   */
  async pageTitle () {
    return new Promise(resolve => {
      this.page.evaluate(() => { return document.title },
        (err, result) => {
          resolve(result)
        })
    })
  }

  /**
   * Waits for the page title to match a given state.
   */
  async waitForPageTitle (expected) {
    var waitFor = this.waitFor.bind(this)
    var pageTitle = this.pageTitle.bind(this)
    return new Promise(async resolve => {
      var result = await waitFor(async () => {
        var title = await pageTitle()
        if (expected instanceof RegExp) {
          return expected.test(title)
        } else {
          return title === expected
        }
      })
      resolve(result)
    })
  }

  /**
   * Returns an element if it finds it in the page, otherwise returns null.
   */
  async findElement (selector) {
    return new Promise(resolve => {
      this.page.evaluate((selector) => {
        return document.querySelector(selector)
      },
      selector,
      (err, result) => {
        if (!result) {
          return resolve(null)
        }
        resolve(new Element(this.page, selector))
      })
    })
  }

  /**
   * Returns all elements that match the current selector in the page.
   */
  async countElements (selector) {
    return new Promise(resolve => {
      this.page.evaluate((selector) => {
        return document.querySelectorAll(selector).length
      },
      selector,
      (err, result) => {
          resolve(result)
        })
    })
  }

  /**
   * Resizes the page to a desired width and height.
   */
  async resize (width, height) {
    this.page.set('viewportSize', {width, height})
  }

  /**
   * Executes a script within the page.
   */
  async script (func, args) {
    if (!Array.isArray(args)) {
      args = [args]
    }

    return new Promise(resolve => {
      this.page.evaluate((stringyFunc, args) => {
        var invoke = new Function(
          "return " + stringyFunc
        )();
        return invoke.apply(null, args)
      },
      func.toString(),
      args,
      (err, result) => {
          resolve(result)
        })
    })
  }

  /**
   * Waits for an arbitrary amount of time.
   */
  async wait (time=1000) {
    return new Promise(resolve => {
      setTimeout(resolve, time)
    })
  }

  /**
   * Waits for an element to exist in the page.
   */
  async waitForElement (selector) {
    // Scoping gets broken within async promises, so bind these locally.
    var waitFor = this.waitFor.bind(this)
    var findElement = this.findElement.bind(this)
    return new Promise(async resolve => {
      var element = await waitFor(async () => {
        var el = await findElement(selector)
        if (el) {
          return el
        }
        return false
      })
      resolve(element)
    })
  }

  /**
   * Waits for an element to be hidden, or removed from the dom.
   */
  async waitForElementNotVisible (selector) {
    var waitFor = this.waitFor.bind(this)
    var findElement = this.findElement.bind(this)
    return new Promise(async resolve => {
      var isHidden = await waitFor(async () => {
        var el = await findElement(selector)
        return !el || !await el.isVisible()
      })
      resolve(isHidden)
    })
  }

  /**
   * Waits for an element to exist, and be visible.
   */
  async waitForElementVisible (selector) {
    var waitFor = this.waitFor.bind(this)
    var findElement = this.findElement.bind(this)
    return new Promise(async resolve => {
      var isVisible = await waitFor(async () => {
        var el = await findElement(selector)
        return el && await el.isVisible()
      })
      resolve(isVisible)
    })
  }

  /**
   * Waits for a condition to be met
   */
  async waitFor (func, pollMs=100) {
    return new Promise(resolve => {
      var poll = async () => {
        var result = await func()
        if (result) {
          resolve(result)
        } else {
          setTimeout(poll, pollMs)
        }
      }
      poll()
    })
  }
}

var ghost = new Ghost()
export default ghost
