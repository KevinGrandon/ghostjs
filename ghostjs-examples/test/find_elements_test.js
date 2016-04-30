import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#findElements', () => {

  before(localServer)
  after(localServer.stop)

  it('we can find elements', async () => {
    await ghost.open('http://localhost:8888/find_elements.html')

    let elements = await ghost.findElements('ul.multiple li')
    assert.equal(elements.length, 3)
    assert.equal(await elements[0].text(), 'Item 1')
    assert.equal(await elements[1].text(), 'Item 2')
    assert.equal(await elements[2].text(), 'Item 3')
  })
})
