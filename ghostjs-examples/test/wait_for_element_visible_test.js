import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#waitForElementNotVisible', () => {

  before(localServer)
  after(localServer.stop)

  it('Should already be true for an element that exists', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')
    await ghost.waitForElementVisible('body')
  })
})
