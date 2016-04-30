import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('element#script', () => {
  before(localServer)
  after(localServer.stop)

  it('we can script with an element', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    var body = await ghost.findElement('body')
    var bodyTag = await body.script((el) => {
      return el.tagName
    })
    assert.equal(bodyTag.toLowerCase(), 'body')
  })

  it('with an element and with arguments', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    var body = await ghost.findElement('body')
    var justCheckArgValue = await body.script((el, arg1) => {
      return arg1
    }, ['with args'])
    assert.equal(justCheckArgValue, 'with args')
  })
})
