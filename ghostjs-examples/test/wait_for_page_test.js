import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#waitForPage', () => {

  before(localServer)
  after(localServer.stop)

  it('we can wait for a page', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    let myElement = await ghost.findElement('#popupLink')
    await myElement.click()
    await ghost.wait(5000)
    await ghost.waitForPage('form.html')
  })
})
