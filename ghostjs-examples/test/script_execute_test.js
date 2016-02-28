import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#script', () => {

  before(localServer)
  after(localServer.stop)

  it('we can execute a script', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    await ghost.script(() => {
      window.__MY_SCRIPT_VAL = 'testing is awesome'
    })

    var val = await ghost.script(() => {
      return window.__MY_SCRIPT_VAL
    })
    assert.equal(val, 'testing is awesome')
  })

  it('we can execute a script /w arguments', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    await ghost.script((myArg1) => {
      window.__MY_SCRIPT_VAL = myArg1
    },
    ['arg passing is awesome'])

    var val = await ghost.script(() => {
      return window.__MY_SCRIPT_VAL
    })
    assert.equal(val, 'arg passing is awesome')
  })
})
