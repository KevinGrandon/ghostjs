import ghost from 'ghostjs'
import assert from 'assert'

describe('ghost#wait', () => {
  it('wait for an arbitrary amount of time', async () => {
    var val = false
    setTimeout(() => {
      val = true
    }, 90)
    await ghost.wait(50)
    assert.equal(val, false)
    await ghost.wait(50)
    assert.equal(val, true)
  })
})
