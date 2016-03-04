import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#usePage', () => {

  before(localServer)
  after(localServer.stop)

  it('we can switch pages using usePage()', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    let myElement = await ghost.findElement('#popupLink')
    await myElement.click()
    await ghost.wait(5000)
    await ghost.waitForPage('form.html')

    // Switch to the popup context
    await ghost.usePage('form.html')

    // Find an element which is in the new page, but not the first.
    let checkbox = await ghost.findElement('#checkbox1')
    assert.equal(await checkbox.isVisible(), true)

    // Switch back to the main page.
    await ghost.usePage()

    // The checkbox should not exist
    let goAwayCheckbox = await ghost.findElement('#checkbox1')
    assert.equal(goAwayCheckbox, null)
  })
})
