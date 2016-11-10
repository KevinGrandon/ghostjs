var debug = require('debug')('ghost:electron')
import {app, BrowserWindow} from 'electron';
import Element from '../element'

export default class ElectronProtocol {
  constructor (ghost) {
    // TEMP: Pull in utility functions from ghost.
    this.wait = ghost.wait

    this.currentWin = null
    this.domLoaded = false
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
      // this.page.injectJs(script)
    })
  }

  handleFailure = (event, code, details, failedUrl, isMainFrame) => {
    if (isMainFrame) {
      this.cleanup({
        message: 'navigation error',
        code,
        details,
        url: failedUrl || this.url
      });
    }
  }

  handleDetails = (event, status, url, oldUrl, statusCode, method, referrer, headers, resourceType) => {
    if (resourceType === 'mainFrame') {
      this.responseDetails = {
        url,
        code,
        method,
        referrer,
        headers
      }
    }
  }

  handleDomReady = () => {
    this.domLoaded = true
  }

  handleFinish = (event) => {
    this.cleanup(null, this.responseDetails)
  }

  cleanup () {
    this.currentWin.webContents.removeListener('did-fail-load', this.handleFailure);
    this.currentWin.webContents.removeListener('did-fail-provisional-load', this.handleFailure);
    this.currentWin.webContents.removeListener('did-get-response-details', this.handleDetails);
    this.currentWin.webContents.removeListener('dom-ready', this.handleDomReady);
    this.currentWin.webContents.removeListener('did-finish-load', this.handleFinish);
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
    return new Promise(resolve => {
      app.on('ready', async () => {
        await this.createWindow(url, options)
        resolve()
      })
    })
  }

  async createWindow (url, options) {
    this.url = url;

    this.currentWin = new BrowserWindow();
    this.currentWin.webContents.on('did-fail-load', this.handleFailure);
    this.currentWin.webContents.on('did-fail-provisional-load', this.handleFailure);
    this.currentWin.webContents.on('did-get-response-details', this.handleDetails);
    this.currentWin.webContents.on('dom-ready', this.handleDomReady);
    this.currentWin.webContents.on('did-finish-load', this.handleFinish);
    this.currentWin.webContents.loadURL(url, loadUrlOptions);
  }

  close () {
    debug('close')
    /*
    if (this.page) {
      this.page.close()
    }
    this.page = null
    this.currentContext = null
    */
  }

  async exit () {
    /*
    this.close()
    this.browser.exit()
    this.browser = null
    */
  }

  /**
   * Sets the current page context to run test methods on.
   * This is useful for running tests in popups for example.
   * To use the root page, pass an empty value.
   */
  async usePage (pagePattern) {
    debug('use page', pagePattern)
    if (!pagePattern) {
      this.currentWin = null;
    } else {
      this.currentContext = await this.waitForPage(pagePattern)
    }
  }

  goBack () {
    debug('goBack')
    this.currentWin.webContents.goBack();
  }

  goForward () {
    debug('goForward')
    this.currentWin.webContents.goForward();
  }

  screenshot (filename, folder='screenshots') {
    var done = (img) => {
      img.toPng()
    }
    this.currentWin.capturePage(done)
  }

  /**
   * Returns the title of the current page.
   */
  async pageTitle () {
    debug('getting pageTitle')
    return await this.script(() => {
      return document.title
    });
  }

  /**
   * Waits for the page title to match a given state.
   */
  async waitForPageTitle (expected) {
    debug('waitForPageTitle')
    // var waitFor = this.wait
    // var pageTitle = this.pageTitle.bind(this)
    // return new Promise(async resolve => {
    //   var result = await waitFor(async () => {
    //     var title = await pageTitle()
    //     if (expected instanceof RegExp) {
    //       return expected.test(title)
    //     } else {
    //       return title === expected
    //     }
    //   })
    //   resolve(result)
    // })
  }

  makeElement (selector, offset) {
    return new Element(
      this.script.bind(this),
      (selector, filePath) => console.log('not implemented yet'),
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
    return new Promise(async resolve => {
      const numElements = await this.script((selector) => {
        return document.querySelectorAll(selector).length
      })

      if (!numElements) {
        return resolve(null)
      }

      var elementCollection = []
      for (var i = 0; i < numElements; i++) {
        elementCollection.push(this.makeElement(selector, i))
      }
      resolve(elementCollection)
    })
  }

  /**
   * Resizes the page to a desired width and height.
   */
  async resize (width, height) {
    debug('resizing to', width, height)
    this.currentWin.setSize(width, height)
  }

  /**
   * Executes a script within the page.
   */
  async script (func, args) {
    debug('scripting page', func)
    return new Promise((resolve, reject) => {
      if (!Array.isArray(args)) {
        args = [args]
      }

      const response = (event, response) => {
        renderer.removeListener('error', error)
        renderer.removeListener('log', log)
        resolve(response)
      }

      const error = (event, error) => {
        renderer.removeListener('log', log)
        renderer.removeListener('response', response)
        reject(error)
      }

      const log = (event, args) => console.log.bind(console)

      renderer.once('response', response)
      renderer.once('error', error)
      renderer.on('log', log)

      this.currentWin.webContents.executeJavaScript((stringyFunc, args) => {
        var invoke = new Function(
          "return " + stringyFunc
        )();
        return invoke.apply(null, args)
      })
    })
  }

  /**
   * Called when wait or waitForElement times out.
   * Can be used as a hook to take screenshots.
   */
  onTimeout (errMessage) {
    console.log('ghostjs timeout', errMessage)
    // this.screenshot('timeout-' + Date.now())
    // throw new Error(errMessage)
  }

  /**
   * Waits for a child page to be loaded.
   */
  waitForPage (url) {
    debug('waitForPage', url)
    // var waitFor = this.wait
    // var childPages = this.childPages
    // return new Promise(async resolve => {
    //   var page = await waitFor(async () => {
    //     return childPages.filter((val) => {
    //       return val.url.includes(url)
    //     })
    //   })
    //   resolve(page[0])
    // })
  }
}
