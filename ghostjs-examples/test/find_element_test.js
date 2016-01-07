import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('Find Element', () => {

  localServer()

  it('we can find an element', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    let myElement = ghost.findElement('#myElement')
    assert.equal(await myElement.text(), 'myElement Content')
    assert.equal(await myElement.html(), 'myElement Content')
  })

  it('waitFor element', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')
    let trigger = ghost.findElement('#moreContentTrigger')
    await trigger.click()

    var isVisible = await ghost.waitFor(async () => {
      var findEl = ghost.findElement('.moreContent')
      return await findEl.isVisible()
    })
    assert.equal(isVisible, true)
  })
})
