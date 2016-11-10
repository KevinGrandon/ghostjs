import ghost from 'ghostjs'
import assert from 'assert'

describe('ghost#waitFor', () => {
  it('we can wait', async () => {
    var curr = 0
    await ghost.wait(() => {
      curr++
      return curr === 10
    }, 10)
    assert.equal(curr, 10)
  })
})
