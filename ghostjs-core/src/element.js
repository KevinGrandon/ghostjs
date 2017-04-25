export default class Element {

  /**
   * Creates a proxy to an element on the page.
   * @param {function} executeScript A method to script with the page.
   * @param {function} uploadFiles A method to upload files to the page.
   * @param {string} selector The selector to locate the element.
   * @param {integer} lookupOffset The offset of the element. Used to lookup a single element in the case of a findElements()
   */
  constructor (executeScript, uploadFile, selector, lookupOffset = 0) {
    this.executeScript = executeScript
    this.uploadFile = uploadFile
    this.selector = selector
    this.lookupOffset = lookupOffset
  }

  async click (x, y) {
    return this.mouse('click', x, y)
  }

  async mouse (method, xPos, yPos) {
    return new Promise(resolve => {
      resolve(this.executeScript((selector, lookupOffset, mouseType, xPos, yPos) => {
        try {
          var el = document.querySelectorAll(selector)[lookupOffset]
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
          console.log('Failed dispatching ' + mouseType + 'mouse event on ' + selector + ': ' + e)
          return false
        }
      },
      [this.selector, this.lookupOffset, method, xPos, yPos]))
    })
  }

  /**
   * "Uploads" a file pointer to a form element to upload on submit.
   */
  async file (filePath) {
    return new Promise(resolve => {
      // TODO: This won't work for element collections (when this instance has an offset)
      this.uploadFile(this.selector, filePath)
      resolve()
    })
  }

  /**
   * Sets a form field to the provided value.
   * For non-text inputs like selects and radio options, we try to check the right value based on option name.
   */
  async fill (setFill) {
    return new Promise(resolve => {
      resolve(this.executeScript((selector, lookupOffset, value) => {
        var el = document.querySelectorAll(selector)[lookupOffset]
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
      [this.selector, this.lookupOffset, setFill]))
    })
  }

  async getAttribute (attribute) {
    return new Promise(resolve => {
      resolve(this.executeScript((selector, lookupOffset, attribute) => {
        return document.querySelectorAll(selector)[lookupOffset][attribute]
      },
      [this.selector, this.lookupOffset, attribute]))
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
      resolve(this.executeScript((selector, lookupOffset) => {
        var el = document.querySelectorAll(selector)[lookupOffset]
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
      [this.selector, this.lookupOffset]))
    })
  }

  async rect (func) {
    return new Promise(resolve => {
      resolve(this.executeScript((selector, lookupOffset) => {
        var el = document.querySelectorAll(selector)[lookupOffset]
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
      [this.selector, this.lookupOffset]))
    })
  }

  async script (func, args) {
    if (!Array.isArray(args)) {
      args = [args]
    }

    return new Promise(resolve => {
      resolve(this.executeScript((func, selector, lookupOffset, args) => {
        var el = document.querySelectorAll(selector)[lookupOffset]
        args.unshift(el)
        var invoke = new Function(
             'return ' + func
        )();
        return invoke.apply(null, args)
      },
      [func.toString(), this.selector, this.lookupOffset, args]))
    })
  }
}
