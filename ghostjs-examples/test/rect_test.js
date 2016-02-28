import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('element#rect', () => {

  before(localServer)
  after(localServer.stop)

  it('Measures the rect of an element', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    var square = await ghost.waitForElement('#square')
    var rect = await square.rect()
    assert.equal(rect.width, 100)
    assert.equal(rect.height, 100)
    assert.ok(rect.left > 0)
    assert.ok(rect.top > 0)
    assert.equal(rect.bottom, rect.height + rect.top)
    assert.equal(rect.right, rect.width + rect.left)
  })
})
