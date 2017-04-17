import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('element#rect', () => {

  before(localServer)

  it('Measures the rect of an element', async () => {
    await ghost.open('http://localhost:8888/dragdrop.html')

    var drag1 = await ghost.waitForElement('#drag1')
    var origRect = await drag1.rect()

    var dropTarget = await ghost.waitForElement('#div1')
    var dropRect = await dropTarget.rect()

    var centerX = (origRect.right + origRect.left)/ 2
    var centerY = (origRect.bottom + origRect.top) / 2
    ghost.page.sendEvent('mousedown', centerX, centerY)
    ghost.page.sendEvent('mousemove', centerX, centerY - (origRect.bottom - dropRect.bottom))
    ghost.page.sendEvent('mouseup', centerX, centerY - (origRect.bottom - dropRect.bottom))

    var newRect = await drag1.rect()
    console.log('Got new rect:', newRect)
  })
})
