var debug = require('debug')('ghost:electron')

export default class ElectronProtocol {
  constructor () {

  }

  /**
   * Adds scripts to be injected to for each page load.
   * Should be called before ghost#open.
   */
  injectScripts () {
    debug('inject scripts', arguments)
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

  /**
   * Opens a page.
   * @param {String} url Url of the page to open.
   * @param {Object} options Keys supported:
   *  settings -  Key: Value map of all settings to set.
   *  headers -  Key: Value map of custom headers.
   *  viewportSize -  E.g., {height: 600, width: 800}
   */
  async open (url, options={}) {
    debug('open url', url, 'options', options)
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
      driver.create(this.driverOpts, (err, browser) => {
        this.browser = browser
        browser.createPage((err, page) => {
          this.page = page;

          options.settings = options.settings || {}
          for (var i in options.settings) {
            page.set('settings.' + i, options.settings[i])
          }

          if (options.headers) {
            page.set('customHeaders', options.headers)
          }

          if (options.viewportSize) {
            page.set('viewportSize', options.viewportSize)
          }

          /**
           * Allow content to pass a custom function into onResourceRequested.
           */
          if (options.onResourceRequested) {
            page.setFn('onResourceRequested', options.onResourceRequested)
          }

          page.onResourceTimeout = (url) => {
            console.log('page timeout when trying to load ', url)
          }

          page.onPageCreated = (page) => {
            var pageObj = {
              page: page,
              url: null
            }

            this.childPages.push(pageObj)

            page.onUrlChanged = (url) => {
              pageObj.url = url;
            }

            page.onClosing = (closingPage) => {
              this.childPages = this.childPages.filter(eachPage => eachPage === closingPage)
            }
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
      })
    })
  }

  close () {
    debug('close')
    if (this.page) {
      this.page.close()
    }
    this.page = null
    this.currentContext = null
  }

  async exit () {
    this.close()
    this.browser.exit()
    this.browser = null
  }

  /**
   * Sets the current page context to run test methods on.
   * This is useful for running tests in popups for example.
   * To use the root page, pass an empty value.
   */
  async usePage (pagePattern) {
    debug('use page', pagePattern)
    if (!pagePattern) {
      this.currentContext = null;
    } else {
      this.currentContext = await this.waitForPage(pagePattern)
    }
  }

  /**
   * Gets the current page context that we're using.
   */
  get pageContext() {
    return (this.currentContext && this.currentContext.page) || this.page;
  }

  goBack () {
    debug('goBack')
    this.pageContext.goBack()
  }

  goForward () {
    debug('goForward')
    this.pageContext.goForward()
  }

  screenshot (filename, folder='screenshots') {
    filename = filename || 'screenshot-' + Date.now()
    this.pageContext.render(`${folder}/${filename}.png`)
  }

  /**
   * Returns the title of the current page.
   */
  async pageTitle () {
    debug('getting pageTitle')
    return new Promise(resolve => {
      this.pageContext.evaluate(() => { return document.title },
        (err, result) => {
          resolve(result)
        })
    })
  }

  /**
   * Waits for the page title to match a given state.
   */
  async waitForPageTitle (expected) {
    debug('waitForPageTitle')
    var waitFor = this.wait.bind(this)
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
   * @param {string} selector
   */
  async findElement (selector) {
    debug('findElement called with selector', selector)
    return new Promise(resolve => {
      this.pageContext.evaluate((selector) => {
        return !!document.querySelector(selector)
      },
      selector,
      (err, result) => {
        if (err) {
          console.warn('findElement error', err)
        }

        if (!result) {
          return resolve(null)
        }
        resolve(new Element(this.pageContext, selector))
      })
    })
  }

  /**
   * Returns an array of {Element} instances that match a selector.
   * @param {string} selector
   */
  async findElements (selector) {
    debug('findElements called with selector', selector)
    return new Promise(resolve => {
      this.pageContext.evaluate((selector) => {
        return document.querySelectorAll(selector).length
      },
      selector,
      (err, numElements) => {
        if (err) {
          console.warn('findElements error', err)
        }

        if (!numElements) {
          return resolve(null)
        }

        var elementCollection = [];
        for (var i = 0; i < numElements; i++) {
          elementCollection.push(new Element(this.pageContext, selector, i))
        }
        resolve(elementCollection)
      })
    })
  }

  /**
   * Resizes the page to a desired width and height.
   */
  async resize (width, height) {
    debug('resizing to', width, height)
    this.pageContext.set('viewportSize', {width, height})
  }

  /**
   * Executes a script within the page.
   */
  async script (func, args) {
    debug('scripting page', func)
    if (!Array.isArray(args)) {
      args = [args]
    }

    return new Promise(resolve => {
      this.pageContext.evaluate((stringyFunc, args) => {
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
   * Waits for an arbitrary amount of time, or an async function to resolve.
   * @param (Number|Function)
   */
  async wait (waitFor=1000, pollMs=100) {
    debug('waiting for', waitFor)
    debug('waiting (pollMs)', pollMs)
    if (!(waitFor instanceof Function)) {
      return new Promise((resolve) => {
        setTimeout(resolve, waitFor)
      })
    } else {
      let timeWaited = 0
      return new Promise((resolve) => {
        var poll = async () => {
          var result = await waitFor()
          if (result) {
            resolve(result)
          } else if (timeWaited > this.waitTimeout) {
            this.onTimeout('Timeout while waiting.')
          } else {
            timeWaited += pollMs
            setTimeout(poll, pollMs)
          }
        }
        poll()
      })
    }
  }

  /**
   * Called when wait or waitForElement times out.
   * Can be used as a hook to take screenshots.
   */
  onTimeout (errMessage) {
    console.log('ghostjs timeout', errMessage)
    this.screenshot('timeout-' + Date.now())
    throw new Error(errMessage)
  }

  /**
   * Waits for an element to exist in the page.
   */
  async waitForElement (selector) {
    debug('waitForElement', selector)
    // Scoping gets broken within async promises, so bind these locally.
    var waitFor = this.wait.bind(this)
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
    debug('waitForElementNotVisible', selector)
    var waitFor = this.wait.bind(this)
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
    debug('waitForElementVisible', selector)
    var waitFor = this.wait.bind(this)
    var findElement = this.findElement.bind(this)
    return new Promise(async resolve => {
      var visibleEl = await waitFor(async () => {
        var el = await findElement(selector)
        if (el && await el.isVisible()) {
          return el
        } else {
          return false
        }
      })
      resolve(visibleEl)
    })
  }

  /**
   * Waits for a child page to be loaded.
   */
  waitForPage (url) {
    debug('waitForPage', url)
    var waitFor = this.wait.bind(this)
    var childPages = this.childPages
    return new Promise(async resolve => {
      var page = await waitFor(async () => {
        return childPages.filter((val) => {
          return val.url.includes(url)
        })
      })
      resolve(page[0])
    })
  }
}

var ghost = new Ghost()
export default ghost
