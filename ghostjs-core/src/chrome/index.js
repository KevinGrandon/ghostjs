/* eslint-disable no-new-func */
const CDP = require('chrome-remote-interface')
const fs = require('fs')
const events = require('events')
const path = require('path')

class ChromePageObject {
  constructor ({ targetId, viewportSize } = {}) {
    this.targetId = targetId
    this.viewportSize = viewportSize || {
      height: 300,
      width: 400
    }
    events.EventEmitter.defaultMaxListeners = Infinity
  }

  getCDP () {
    if (this.initialPromise) {
      return this.initialPromise
    }

    this.initialPromise = new Promise((resolve) => {
      if (this._client) {
        resolve(this._client)
        return
      }

      const startRequest = Date.now()
      let backoffStartupTime = 25
      const maxStartupTime = 60000

      const initCDP = () => {
        CDP(async (client) => {
          this._client = client

          // If we have a targetId, connect to that.
          if (this.targetId) {
            const { Target } = client
            try {
              await Target.attachToTarget({ targetId: this.targetId })
            } catch (e) {
              console.log('Could not attach to target', this.targetId, e)
            }
          }

          resolve(client)
        }).on('error', (err) => {
          if (Date.now() - startRequest > maxStartupTime) {
            console.error('CDP Error: ' + err.stack)
          } else {
            backoffStartupTime *= 2
            setTimeout(initCDP, backoffStartupTime)
          }
        })
      }
      setTimeout(initCDP, backoffStartupTime)
    })

    return this.initialPromise
  }

  open (url, cb) {
    this.getCDP().then(async (client) => {
      const { Page, Emulation, Security, Target, Network } = client
      const deviceMetrics = {
        width: this.viewportSize.width,
        height: this.viewportSize.height,
        deviceScaleFactor: 0,
        mobile: false,
        fitWindow: true
      }

      try {
        Security.certificateError((res) => {
          cb(null, 'fail')
        })

        await Target.setDiscoverTargets({ discover: true })

        Target.targetCreated(async ({ targetInfo }) => {
          if (targetInfo.type === 'page') {
            const { targetId } = targetInfo

            // TODO: Handle the rest of the phantom childPage contract used in ghost.
            const subPageObj = new ChromePageObject({ targetId })
            subPageObj.evaluate(() => window.location.toString(), (err, targetLocation) => {
              if (err) {
                console.log(err)
              }
              this.onPageCreated(subPageObj)
              subPageObj.onUrlChanged(targetLocation)
            })
          }
        })

        await Page.enable()
        await Security.enable()
        await Network.enable()

        if (this.networkOptions) {
          const {
            offline = false,
            latency = 0,
            downloadThroughput,
            uploadThroughput
          } = this.networkOptions

          const canEmulateNetworkConditions = await Network.canEmulateNetworkConditions()

          if (canEmulateNetworkConditions) {
            await Network.emulateNetworkConditions({
              offline: offline,
              latency: latency,
              downloadThroughput: downloadThroughput,
              uploadThroughput: uploadThroughput
            })
          } else {
            console.warn('Unable to emulate network conditions in Chrome')
          }
        }

        await Emulation.setDeviceMetricsOverride(deviceMetrics)
        await Page.navigate({url: url})
        await Page.loadEventFired(() => {
          cb(null, url)
        })
      } catch (err) {
        console.error(err.stack)
        const failMessage = 'fail'
        cb(failMessage, null)
      }
    })
  }

  async render (filePath) {
    this.getCDP().then(async (client) => {
      const { Page } = client
      try {
        const { data } = await Page.captureScreenshot()
        fs.writeFileSync(filePath, Buffer.from(data, 'base64'))
      } catch (err) {
        console.error(err)
      }
    })
  }

  evaluate (fn, ...args) {
    this.getCDP().then(async (client) => {
      const { Runtime } = client
      try {
        const cb = args.pop()
        let executor = (stringyFunc, args) => {
          let invoke = new Function(
            'return ' + stringyFunc
          )()
          return invoke.apply(null, args)
        }
        let executorString = `(${executor})(${fn.toString()}, ${JSON.stringify(args)})`
        await Runtime.enable()
        const { result } = await Runtime.evaluate({expression: executorString, returnByValue: true})
        const value = result.value
        cb(null, value)
      } catch (err) {
        console.log(err.stack)
        const cb = args.pop()
        cb(err, null)
        console.error(err)
      }
    })
  }

  async goForward () {
    this.getCDP().then(async (client) => {
      const { Page } = client
      try {
        await Page.enable()
        let {currentIndex, entries} = await Page.getNavigationHistory()
        if (currentIndex === entries.length - 1) {
          return
        } else {
          await Page.navigateToHistoryEntry({ entryId: entries[currentIndex + 1].id })
        }
      } catch (err) {
        console.error(err)
      }
    })
  }

  async goBack () {
    this.getCDP().then(async (client) => {
      const { Page } = client
      try {
        await Page.enable()
        let {currentIndex, entries} = await Page.getNavigationHistory()
        if (currentIndex === 0) {
          return
        } else {
          await Page.navigateToHistoryEntry({ entryId: entries[currentIndex - 1].id })
        }
      } catch (err) {
        console.error(err)
      }
    })
  }

  async injectJs (scriptPath) {
    const js = fs.readFileSync(scriptPath, {encoding: 'utf8'}).trim()
    const { Runtime } = this._client
    try {
      let expression = `(()=>{${js}})()`
      await Runtime.evaluate({ expression: expression })
    } catch (err) {
      console.error(err)
    }
  }

  close () {
    this.getCDP().then(async (client) => {
      if (this.targetId) {
        const { Target } = client
        Target.detachFromTarget({ targetId: this.targetId })
      }
      await client.close()
    })
  }

  set (param, options) {
    this.getCDP().then(async (client) => {
      if (param === 'viewportSize') {
        const { width, height } = options
        const { Emulation } = client

        this.viewportSize = {
          width,
          height
        }

        const deviceMetrics = {
          width: width,
          height: height,
          deviceScaleFactor: 0,
          mobile: false,
          fitWindow: true
        }

        Emulation.setDeviceMetricsOverride(deviceMetrics)
      } else if (param === 'networkOption') {
        this.networkOptions = options
      } else {
        console.warn(`${param} currently not supported for Chrome.`)
      }
    })
  }
}

ChromePageObject.create = (options, callback) => {
  const pageObj = new ChromePageObject()

  callback(null, {
    createPage: (pageCb) => {
      pageCb(null, pageObj)
    },
    exit: () => {
      pageObj.close()
    }
  })
}

ChromePageObject.path = path.join(__dirname, '/binary')

module.exports = ChromePageObject
