import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#screenshot', () => {

  before(localServer)
  after(localServer.stop)

  it('returns the filename', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    let filePath = await ghost.screenshot('took_a_screenshot.png')
    assert.ok(filePath.includes('took_a_screenshot.png'), `${filePath} should include 'took_a_screenshot.png'`)
  })

})
