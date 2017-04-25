import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#findElement', () => {

  before(localServer)
  after(localServer.stop)

  it('we can find an element', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    let myElement = await ghost.findElement('#myElement')
    assert.equal(await myElement.text(), 'myElement Content')
    assert.equal(await myElement.html(), 'myElement Content')
  })

  it('wait for element state', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')
    let trigger = await ghost.findElement('#moreContentTrigger')
    await trigger.click()

    var isVisible = await ghost.wait(async () => {
      var findEl = await ghost.findElement('.moreContent')
      return findEl && await findEl.isVisible()
    })
    assert.equal(isVisible, true)
  })

  it('null element', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')
    let nonExistantElement = await ghost.findElement('#omgthiselementshouldnotexist')
    assert.equal(nonExistantElement, null)
  })
})
