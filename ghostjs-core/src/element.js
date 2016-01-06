export default class Element {

  constructor (page, selector) {
    this.page = page
    this.selector = selector
  }

  async getAttribute (attribute) {
    return new Promise(resolve => {
      var attributeVal = this.page.evaluate(function(selector, attribute) {
        return document.querySelector(selector)[attribute]
      }, (result) => {
        resolve(result)
      }, this.selector, attribute)
    })
  }

  async text () {
    return await this.getAttribute('textContent')
  }

  async html () {
    return await this.getAttribute('innerHTML')
  }
}
