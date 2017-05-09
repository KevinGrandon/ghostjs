const CDP = require('chrome-remote-interface');
const fs = require('fs');

class ChromePageObject {

  constructor() {
    this.path = __dirname + '/binary';
  }

  getCDP() {
    return new Promise((resolve) => {
      if (!this._client) {
        // Arbitrary wait for startup.
        // TODO, remove this.
        const ARBITRARY_STARTUP_WAIT = 1000;
        setTimeout(() => {
          CDP((client) => {
            this._client = client;
            resolve(client);
          }).on('error', (err) => {
            console.error("CDP Error: " + err.stack);
          });
        }, ARBITRARY_STARTUP_WAIT);
      } else {
        resolve(this._client);
      }
    })
  }

  open(url, cb) {
    this.getCDP().then(async (client) => {
      const { Page, Emulation, Security } = client;
      const defaultViewportHeight = 300;
      const defaultViewportWidth = 400;

      const deviceMetrics = {
        width: defaultViewportWidth,
        height: defaultViewportHeight,
        deviceScaleFactor: 0,
        mobile: false,
        fitWindow: false
      };

      try {
        Security.certificateError((res) => {
          cb(null, 'fail');
        })

        await Page.enable();
        await Security.enable();

        await Emulation.setDeviceMetricsOverride(deviceMetrics);
        await Page.navigate({url: url});
        await Page.loadEventFired(() => {
          cb(null, url);
        });

      } catch (err) {
        console.error(err.stack);
        cb('fail', null);
      }
    });
  }

  async render(filePath) {
    this.getCDP().then(async (client) => {
      const { Page } = client;
      try {
        const { data } = await Page.captureScreenshot();
        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
      } catch (err) {
        console.error(err);
      }
    });
  }

  evaluate(fn, ...args) {
    this.getCDP().then(async (client) => {
      const { Page, Runtime } = client;
      try {
        const cb = args.pop();
        let executor = (stringyFunc, args) => {
          let invoke = new Function(
            "return " + stringyFunc
          )();
          return invoke.apply(null, args)
        }
        let executorString = `(${executor})(${fn.toString()}, ${JSON.stringify(args)})`
        await Runtime.enable();
        const { result } = await Runtime.evaluate({expression: executorString, returnByValue: true});
        const value = result.value;
        cb (null, value);
      } catch (err) {
        cb(err, null);
        console.error(err);
      }
    });
  }

  async goForward() {
    this.getCDP().then(async (client) => {
      const { Page } = client;
      try {
        await Page.enable();
        let {currentIndex, entries} = await Page.getNavigationHistory()
        if (currentIndex === entries.length-1) {
          return;
        } else {
          await Page.navigateToHistoryEntry({ entryId: entries[currentIndex+1].id });
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  async goBack() {
    this.getCDP().then(async (client) => {
      const { Page } = client;
      try {
        await Page.enable();
        let {currentIndex, entries} = await Page.getNavigationHistory();
        if (currentIndex === 0) {
          return;
        } else {
          await Page.navigateToHistoryEntry({ entryId: entries[currentIndex-1].id });
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  async injectJs(scriptPath) {
    const js = fs.readFileSync(scriptPath, {encoding: 'utf8'}).trim();
    // TODO: Allow this to be async.
    // this.getCDP().then(async (client) => {
      const { Page, Runtime } = this._client;
      try {
        let expression = `(()=>{${js}})()`
        const result = await Runtime.evaluate({ expression: expression });
      } catch (err) {
        console.error(err);
      }
    // });
  }

  close() {
    this.getCDP().then(async (client) => {
      await client.close();
    });
  }

  set(param, options) {
    this.getCDP().then(async (client) => {
      if (param === 'viewportSize') {
        const { width, height } = options;
        const { Emulation } = client;

        const deviceMetrics = {
          width: width,
          height: height,
          deviceScaleFactor: 0,
          mobile: false,
          fitWindow: false
        };

        Emulation.setDeviceMetricsOverride(deviceMetrics);
      }
    })
  }
}

module.exports = ChromePageObject;
