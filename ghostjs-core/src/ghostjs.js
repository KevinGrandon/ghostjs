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
      this.page.evaluate(function () { return document.title }, result => {
        resolve(result)
      })
    })
  }

  findElement (selector) {
    return new Element(this.page, selector);
  }
}

var ghost = new GhostJS()
export default ghost
