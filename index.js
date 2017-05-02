const CDP = require('chrome-remote-interface');
const fs = require('fs');

const open = (url, cb) => {
  CDP (async (client) => {
    const { Page } = client;
    try {
      await Page.enable();
      await Page.navigate({url: url});
      await Page.loadEventFired();
      cb (null, url)
    } catch (err) {
      cb (err, null);
      console.error(err);
    }
  }).on('error', (err) => {
    console.error(err);
  });
}

const render = (filePath) => {
  CDP(async (client) => {
    const { Page } = client;
    try {
        await Page.enable();
        await Page.loadEventFired();
        const { data } = await Page.captureScreenshot();
        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
    } catch (err) {
        console.error(err);
    }
    await client.close();
  }).on('error', (err) => {
    console.error(err);
  });
}

const evaluate = (fn, cb, ...args) => {
  CDP(async (client) => {
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
      await Page.enable();
      await Page.loadEventFired();
      const { result: { value } } = await Runtime.evaluate({expression: executorString});
      cb (null, value);
    } catch (err) {
      cb(err, null);
      console.error(err);
    }
    await client.close();
  }).on('error', (err) => {
    console.error(err);
  });
}

const goForward = () => {
  CDP(async (client) => {
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
    await client.close();
  }).on('error', (err) => {
    console.error(err);
  });
}

const goBack = () => {
  CDP(async (client) => {
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
    await client.close();
  }).on('error', (err) => {
    console.error(err);
  })
}
