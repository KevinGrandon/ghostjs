import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#waitForElementNotVisible', () => {

  before(localServer)
  after(localServer.stop)

  it('Returns an element after it appears', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    // Hide the element after 150ms
    var el = await ghost.findElement('body')
    assert.equal(await el.isVisible(), true)

    setTimeout(async() => {
      await el.script(body => {
        body.style.display = 'none'
      })
    }, 150)

    await ghost.waitForElementNotVisible('body')
    assert.equal(await el.isVisible(), false)
  })

  it('Should already be true for an element that doesn\'t exist', async () => {
    await ghost.waitForElementNotVisible('#omfgIdontExist')
  })
})
