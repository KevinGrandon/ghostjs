var phantom = require('phantom');

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

  async pageTitle () {
    return new Promise(resolve => {
      this.page.evaluate(function () { return document.title }, result => {
        resolve(result)
      });
    });
  }
}

var ghost = new GhostJS()
export default ghost
