import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('element mouse events test', () => {

  before(localServer)

  it('triggers mousedown event', async () => {
    await ghost.open('http://localhost:8888/mouse_test.html')

    let target = await ghost.findElement('#target')
    assert.equal(await target.text(), 'default')

    await target.mouse('mousedown')
    assert.equal(await target.text(), 'mousedown')

    await target.mouse('mousemove')
    assert.equal(await target.text(), 'mousemove')

    await target.mouse('mouseup')
    assert.equal(await target.text(), 'mouseup')
  })
})
