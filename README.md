## GhostJS Chrome Adapter

A Chrome/Headless Chrome adapter layer for running [GhostJS](https://github.com/kevingrandon/ghostjs) scripts.

### Installation

```
yarn
```

### Local development in OSX

Start Chrome with remote debugging. If you don't have Canary installed, you should download it and follow the instructions
[here](https://www.google.com/chrome/browser/canary.html). Then, fire up a Canary instance using the following command:

```
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --remote-debugging-port=9222  http://latest.pinterest.com
```

In a separate terminal tab, run the test scripts against your local Chrome:
```
node index.js
```
