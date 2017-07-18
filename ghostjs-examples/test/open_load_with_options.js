import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#open', () => {
  before(localServer)
  after(localServer.stop)

  it('Loads a webpage with several options being set in all browsers', async () => {
    const options = {
      settings: {
        firstOption: true,
        secondOption: false,
      },
      viewportSize: {
        width: 1200,
        height: 900,
      },
      headers: {
        'some-header': 'blah',
      },
    }

    await ghost.open('http://localhost:8888/basic_content.html', options)
    assert.equal(await ghost.pageTitle(), 'Basic Content')
  });
});
