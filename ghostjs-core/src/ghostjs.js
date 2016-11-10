var debug = require('debug')('ghost')
var argv = require('yargs').argv

import PhantomProtocol from './protocol/phantom'
import ElectronProtocol from './protocol/electron'

class Ghost {
  constructor () {
    // Default timeout per wait.
    this.waitTimeout = 30000

    let protocolType = argv['ghost-protocol'] || 'phantom'

    if (protocolType === 'phantom') {
      this.protocol = new PhantomProtocol(this);
    } else {
      this.protocol = new ElectronProtocol(this);
    }
  }

  /**
   * Adds scripts to be injected to for each page load.
   * Should be called before ghost#open.
   */
  injectScripts () {
    debug('inject scripts', arguments)
    const args = Array.slice(arguments)
    this.protocol.injectScripts.apply(this.protocol, args)
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
    return this.protocol.open(url, options)
  }

  close () {
    debug('close')
    return this.protocol.close()
  }

  goBack () {
    debug('goBack')
    this.protocol.goBack()
  }

  goForward () {
    debug('goForward')
    this.protocol.goForward()
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
    return this.protocol.findElement(selector)
  }

  /**
   * Returns an array of {Element} instances that match a selector.
   * @param {string} selector
   */
  async findElements (selector) {
    debug('findElements called with selector', selector)
    return this.protocol.findElements(selector)
  }

  /**
   * Resizes the page to a desired width and height.
   */
  async resize (width, height) {
    debug('resizing to', width, height)
    return this.protocol.resize(width, height)
  }

  /**
   * Executes a script within the page.
   */
  async script (func, args) {
    debug('scripting page', func)
    return this.protocol.script(func, args)
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
    return this.protocol.onTimeout(errMessage)
  }

  async exit () {
    debug('exit')
    return await this.protocol.exit()
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
  async waitForPage (url) {
    debug('waitForPage', url)
    return await this.protocol.waitForPage(url)
  }

  async usePage (pagePattern) {
    debug('usePage', pagePattern)
    return await this.protocol.usePage(pagePattern)
  }

  async pageTitle () {
    debug('pageTitle')
    return await this.protocol.pageTitle()
  }

  async waitForPageTitle (expected) {
    debug('waitForPageTitle', expected)
    return await this.protocol.waitForPageTitle(expected)
  }

  async setDriverOpts (options) {
    debug('setDriverOpts', options)
    if (!this.protocol.setDriverOpts) {
      console.log('The test protocol does not support setDriverOpts.')
      return
    }
    return await this.protocol.setDriverOpts(options)
  }
}

var ghost = new Ghost()
export default ghost
