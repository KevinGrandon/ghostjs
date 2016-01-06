var phantom = require('phantom')

import Element from './element';

class GhostJS {
  constructor () {
  }

  async open (url) {
  	return new Promise(resolve => {
  		phantom.create(ph => {
        this.phantom = ph
        ph.createPage((page) => {
          this.page = page;
          page.open(url, (status) => {
            resolve(status);
          })
        })
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

  findElement (selector) {
    return new Element(this.page, selector);
  }

  async waitFor (func, pollMs=100) {
    return new Promise(resolve => {
      var poll = () => {
        var result = func()
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
