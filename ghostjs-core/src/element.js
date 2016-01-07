export default class Element {

  constructor (page, selector) {
    this.page = page
    this.selector = selector
  }

  async click (x, y) {
    return this.mouse('click', x, y)
  }

  async mouse (method, xPos, yPos) {
    return new Promise(resolve => {
      this.page.evaluate((selector, mouseType, xPos, yPos) => {
        try {
          var el = document.querySelector(selector)
          var evt = document.createEvent('MouseEvents')
          var calculatedX = xPos || 1
          var calculatedY = yPos || 1
          try {
            var pos = el.getBoundingClientRect()
            if (!xPos) {
              calculatedX = Math.floor((pos.left + pos.right) / 2)
            }
            if (!yPos) {
              calculatedY = Math.floor((pos.top + pos.bottom) / 2)
            }
          } catch(e) {}
          evt.initMouseEvent(mouseType, true, true, window, 1, 1, 1, calculatedX, calculatedY, false, false, false, false, 0, el)
          el.dispatchEvent(evt)
          return true
        } catch (e) {
          console.log('Failed dispatching ' + mouseType + 'mouse event on ' + selector + ': ' + e, 'error')
          return false
        }
      },
      resolve,
      this.selector, method, xPos, yPos)
    })
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

  async html () {
    return await this.getAttribute('innerHTML')
  }

  async text () {
    return await this.getAttribute('textContent')
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
        if (!style) {
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

  async rect (func) {
    return new Promise(resolve => {
      this.page.evaluate((selector) => {
        var el = document.querySelector(selector)
        if (!el) {
          return null
        }

        var rect = el.getBoundingClientRect()
        return {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          height: rect.height,
          width: rect.width
        }
      },
      resolve,
      this.selector)
    })
  }

  async script (func) {
    return new Promise(resolve => {
      this.page.evaluate((func, selector) => {
        var el = document.querySelector(selector)
        var invoke = new Function(
             "return " + func
        )();
        return invoke(el)
      },
      resolve,
      func.toString(), this.selector)
    })
  }
}
