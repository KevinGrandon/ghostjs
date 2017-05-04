const CDP = require('chrome-remote-interface');
const fs = require('fs');

class ChromePageObject {
  getCDP() {
    return new Promise((resolve) => {
      if (!this._client) {
        CDP((client) => {
          this._client = client;
          resolve(client);
        }).on('error', (err) => {
          console.error("CDP Error: " + err.stack);
        });
      } else {
        resolve(this._client);
      }
    })
  }

  open(url, cb) {
    this.getCDP().then(async (client) => {
      const { Page } = client;
      try {
        await Page.enable();
        await Page.navigate({url: url});
        await Page.loadEventFired();
        cb(null, url)
      } catch (err) {
        cb(err, null);
        console.error(err);
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

  evaluate(fn, cb, ...args) {
    this.getCDP().then(async (client) => {
      const { Page, Runtime } = client;
      try {
        let executor = (stringyFunc, args) => {
          let invoke = new Function(
            "return " + stringyFunc
          )();
          return invoke.apply(null, args)
        }
        let executorString = `(${executor})(${fn.toString()}, ${JSON.stringify(args)})`
        await Runtime.enable();
        const { result: { value } } = await Runtime.evaluate({expression: executorString});
        cb (null, value);
      } catch (err) {
        cb(err, null);
        console.error(err);
      }
    });
  }

  goForward() {
    this.getCDP().then(async (client) => {
      const { Page } = client;
      try {
          await Page.enable();
          let {currentIndex, entries} = await Page.getNavigationHistory();
          if (currentIndex === entries.length-1) {
            return;
          } else {
            await Page.navigate({url: entries[currentIndex+1].url});
          }
      } catch (err) {
          console.error(err);
      }
    });
  }

  goBack() {
    this.getCDP().then(async (client) => {
      const { Page } = client;
      try {
        await Page.enable();
        let {currentIndex, entries} = await Page.getNavigationHistory();
        if (currentIndex === 0) {
          return;
        } else {
          await Page.navigate({url: entries[currentIndex-1].url});
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  injectJs(scriptPath) {
    const js = fs.readFileSync(scriptPath, {encoding: 'utf8'});
    this.getCDP().then(async (client) => {
      const { Page, Runtime } = client;
      try {
        await Runtime.enable();
        await Page.enable();
        await Page.loadEventFired();
        const result = await Runtime.evaluate({ expression: js });
      } catch (err) {
        console.error(err);
      }
    });
  }

  close() {
    this.getCDP().then(async (client) => {
      await client.close();
    });
  }
}

const page = new ChromePageObject();
module.exports = page;
