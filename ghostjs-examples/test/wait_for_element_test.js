import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#waitForElement', () => {
  before(localServer)
  after(localServer.stop)

  it('Returns an element after it appears', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    // The element should initially not exist
    var findEl = await ghost.findElement('.moreContent')
    assert.equal(findEl, null)

    let trigger = await ghost.findElement('#moreContentTrigger')
    await trigger.click()

    findEl = await ghost.waitForElement('.moreContent')
    assert.equal(await findEl.isVisible(), true)
  })
})
