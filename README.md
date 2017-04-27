## GhostJS Chrome Adapter

A Chrome/Headless Chrome adapter layer for running [GhostJS](https://github.com/kevingrandon/ghostjs) scripts.

### Installation

```
yarn
```

### Local development in OSX

Start Chrome with remote debugging.
```
/Applications/Google\ Chrome\ Canary.app/Contents/MacOS/Google\ Chrome\ Canary --remote-debugging-port=9222  http://latest.pinterest.com
```

Run the test scripts against your local Chrome:
```
node index.js
```
