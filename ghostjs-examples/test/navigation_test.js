import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('Navigation', () => {

  localServer()

  it('navigates', async () => {
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

})
