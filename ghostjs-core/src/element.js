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

  /**
   * Sets a form field to the provided value.
   * For non-text inputs like selects and radio options, we try to check the right value based on option name.
   */
  async fill (setFill) {
    return new Promise(resolve => {
      this.page.evaluate((selector, value) => {
        var el = document.querySelector(selector)
        if (!el) {
          return null
        }

        // Focus on the element
        try {
          el.focus()
        } catch (e) {
          console.log('Unable to focus on element ' + el.outerHTML + ': ' + e)
        }

        var nodeName = el.nodeName.toLowerCase()
        switch (nodeName) {
          case 'input':
            var type = el.getAttribute('type') || 'text'
            switch (type.toLowerCase()) {
              case 'checkbox':
                el.checked = !!value;
                break;
              case 'file':
                throw {
                  name: 'FileUploadError',
                  message:'File support coming soon.',
                  path: value
                }
              case 'radio':
                el.checked = !!value
                break;
              default:
                el.value = value;
                break
            }
            break;
          case 'select':
            if (el.multiple) {
              [].forEach.call(el.options, function(option) {
                option.selected = value.indexOf(option.value) !== -1
              })
              // Search options if we can't find the value.
              if (el.value === '') {
                [].forEach.call(el.options, function(option) {
                  option.selected = value.indexOf(option.text) !== -1;
                })
              }
            } else {
              el.value = value

              // Search options if we can't find the value.
              if (el.value !== value) {
                [].some.call(el.options, function(option) {
                  option.selected = value === option.text
                  return value === option.text
                })
              }
            }
            break;
          case 'textarea':
            el.value = value
            break;
          default:
            console.log('unsupported type', nodeName)
        }

        // Emulate the change and input events
        ['change', 'input'].forEach(function(name) {
          var event = document.createEvent('HTMLEvents')
          event.initEvent(name, true, true)
          el.dispatchEvent(event)
        })

        // Blur the element
        try {
          el.blur()
        } catch (e) {
          console.log('Unable to blur element ' + el.outerHTML + ': ' + e)
        }
      },
      resolve,
      this.selector, setFill)
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
             'return ' + func
        )();
        return invoke(el)
      },
      resolve,
      func.toString(), this.selector)
    })
  }
}
