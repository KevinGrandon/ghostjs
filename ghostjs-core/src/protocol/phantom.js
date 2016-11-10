var debug = require('debug')('ghost:phantom')
var argv = require('yargs').argv
var driver = require('node-phantom-simple')
import Element from '../element'

export default class PhantomProtocol {
  constructor (ghost) {
    // TEMP: Pull in utility functions from ghost.
    this.wait = ghost.wait

    this.testRunner = argv['ghost-runner'] || 'phantomjs-prebuilt'
    this.driverOpts = null
    this.setDriverOpts({})
    this.browser = null
    this.currentContext = null
    this.page = null
    this.childPages = []
    this.clientScripts = []

    // Open the console if we're running slimer, and the GHOST_CONSOLE env var is set.
    if (this.testRunner.match(/slimerjs/) && process.env.GHOST_CONSOLE) {
      this.setDriverOpts({parameters: ['-jsconsole']})
    }
  }

  /**
   * Sets options object that is used in driver creation.
   */
  setDriverOpts (opts) {
    debug('set driver opts', opts)
    this.driverOpts = this.testRunner.match(/phantom/)
        ? opts
        : {}

    if (opts.parameters) {
        this.driverOpts.parameters = opts.parameters
    }

    this.driverOpts.path = require(this.testRunner).path

    // The dnode `weak` dependency is failing to install on travis.
    // Disable this for now until someone needs it.
    this.driverOpts.dnodeOpts = { weak: false }
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
    var waitFor = this.wait
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

  makeElement (selector, offset) {
    return new Element(
      this.script.bind(this),
      (selector, filePath) => this.pageContextuploadFile(selector, filePath),
      selector,
      offset
    )
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
        resolve(this.makeElement(selector))
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
          elementCollection.push(this.makeElement(selector, i))
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
   * Called when wait or waitForElement times out.
   * Can be used as a hook to take screenshots.
   */
  onTimeout (errMessage) {
    console.log('ghostjs timeout', errMessage)
    this.screenshot('timeout-' + Date.now())
    throw new Error(errMessage)
  }

  /**
   * Waits for a child page to be loaded.
   */
  waitForPage (url) {
    debug('waitForPage', url)
    var waitFor = this.wait
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
