import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#injectScripts', () => {
  before(localServer)
  after(localServer.stop)

  it('we can inject scripts', async () => {
    ghost.injectScripts('test/fixtures/client_script.js')
    await ghost.open('http://localhost:8888/basic_content.html')

    var result = await ghost.script(() => {
      return window.__INJECTED_SCRIPT_STRING
    })
    assert.equal(result, 'an injected string')
  })
})
