import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#goBack/goForward', () => {

  before(localServer)

  it('navigates after ghost.open() call', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')
    assert.equal(await ghost.pageTitle(), 'Basic Content')

    await ghost.open('http://localhost:8888/form.html')
    assert.equal(await ghost.pageTitle(), 'Form')

    ghost.goBack()
    await ghost.waitFor(async () => {
      return await ghost.pageTitle() === 'Basic Content'
    })

    ghost.goForward()
    await ghost.waitFor(async () => {
      return await ghost.pageTitle() === 'Form'
    })
  })

  it('able to go back after clicking a link', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')
    var formLink = await ghost.findElement('#formLink')
    await formLink.click()
    await ghost.waitForPageTitle('Form')

    ghost.goBack()
    await ghost.waitForPageTitle(/Basic/)
  })
})
