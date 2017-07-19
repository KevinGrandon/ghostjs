import ghost from 'ghostjs';
import assert from 'assert';

import localServer from './fixtures/server';

describe('Network throttling', () => {

  before(localServer)
  after(localServer.stop)

  it ('Takes longer to load a page on a slower connection', async () => {
    // This test should just run in a Chrome environment
    if (ghost.testRunner.match(/chrome/)) {
      await ghost.close()
      const url = 'http://google.com'

      let options = {
        networkOption: ghost.networkTypes['regular2g']
      }

      let start = Date.now()
      await ghost.open(url, options)
      let stop = Date.now() - start

      let diff1 = stop

      await ghost.close()
      options.networkOption = ghost.networkTypes['regular4g']

      start = Date.now()
      await ghost.open(url, options)
      stop = Date.now() - start

      let diff2 = stop

      console.log(diff1, diff2)
      assert.equal(diff1 > diff2, true)
    }
  })
})