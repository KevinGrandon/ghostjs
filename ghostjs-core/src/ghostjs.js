var phantom = require('phantom')

import Element from './element';

class GhostJS {
  constructor () {
  }

  async open (url) {
    if (this.phantom) {
      this.phantom.exit()
    }

  	return new Promise(resolve => {
  		phantom.create(ph => {
        this.phantom = ph
        ph.createPage((page) => {
          this.page = page;
          page.open(url, (status) => {
            resolve(status);
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

  screenshot (filename, folder='screenshots') {
    filename = filename || 'screenshot-' + Date.now()
    this.page.render(`${folder}/${filename}.png`)
  }

  async pageTitle () {
    return new Promise(resolve => {
      this.page.evaluate(() => { return document.title }, result => {
        resolve(result)
      })
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
      (result) => {
        if (!result) {
          return resolve(null)
        }
        resolve(new Element(this.page, selector))
      },
      selector)
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
      resolve,
      selector)
    })
  }

  /**
   * Waits for an element to exist in the page.
   */
  async waitForElement (selector) {
  }

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

var ghost = new GhostJS()
export default ghost
