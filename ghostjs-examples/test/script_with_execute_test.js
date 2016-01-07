import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('Element Script Execution', () => {

  localServer()

  it('we can script with an element', async () => {
    await ghost.open('http://localhost:8888/basic_content.html')

    var body = await ghost.findElement('body')
    var bodyTag = await body.scriptWith((el) => {
      return el.tagName
    })
    assert.equal(bodyTag.toLowerCase(), 'body')
  })
})
