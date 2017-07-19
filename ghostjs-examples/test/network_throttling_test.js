import ghost from 'ghostjs';
import assert from 'assert';

import localServer from './fixtures/server';

describe('Network throttling', () => {

  before(localServer)
  after(localServer.stop)

  it ('Takes longer to load a page on a slow connection', async () => {
    // This test should just run in a Chrome environment
    if (ghost.testRunner.match(/chrome/)) {
      let options = {
        networkOptions: {
          connectionType: ghost.networkTypes['2g'],
          uploadThroughput: 50,
          downloadThroughput: 50,
        }
      }

      const NS_PER_S = 1e9
      const url = 'http://localhost:8888/basic_content.html'

      let start = process.hrtime()
      await ghost.open(url,  options)
      let stop = process.hrtime(start)

      let diff1 = stop[0] * NS_PER_S + stop[1]

      options.networkOptions.connectionType = ghost.networkTypes['4g']

      start = process.hrtime()
      await ghost.open(url, options)
      stop = process.hrtime(start)

      let diff2 = stop[0] * NS_PER_S + stop[1]

      assert.equal(diff1 > diff2, true)

    }
  })
})