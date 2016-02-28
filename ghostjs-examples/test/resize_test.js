import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#resize', () => {

  before(localServer)
  after(localServer.stop)

  it('we can find an element', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    var [width, height] = await ghost.script(() => {
      return [window.innerWidth, window.innerHeight]
    })
    assert.equal(width, 400)
    assert.equal(height, 300)

    await ghost.resize(500, 600)

    var [width2, height2] = await ghost.script(() => {
      return [window.innerWidth, window.innerHeight]
    })
    assert.equal(width2, 500)
    assert.equal(height2, 600)
  })
})
