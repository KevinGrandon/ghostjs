export default class Element {

  constructor (page, selector) {
    this.page = page
    this.selector = selector
  }

  async getAttribute (attribute) {
    return new Promise(resolve => {
      this.page.evaluate((selector, attribute) => {
        return document.querySelector(selector)[attribute]
      },
      resolve,
      this.selector, attribute)
    })
  }

  async text () {
    return await this.getAttribute('textContent')
  }

  async html () {
    return await this.getAttribute('innerHTML')
  }

  async isVisible () {
    return new Promise(resolve => {
      this.page.evaluate((selector) => {
        var el = document.querySelector(selector)
        var style
        try {
          style = window.getComputedStyle(el, null)
        } catch (e) {
          return false
        }
        var hidden = style.visibility === 'hidden' || style.display === 'none';
        if (hidden) {
          return false
        }
        if (style.display === 'inline' || style.display === 'inline-block') {
          return true
        }
        return el.clientHeight > 0 && el.clientWidth > 0
      },
      resolve,
      this.selector)
    })
  }

  scriptWith (func) {
    return new Promise(resolve => {
      this.page.evaluate((func, selector) => {
        var el = document.querySelector(selector)
        var invoke = new Function(
             "return " + func
        )();
        return invoke();
      },
      resolve,
      func.toString(), this.selector)
    })
  }
}
