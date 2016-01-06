var assert = require('assert')

var timeoutGenerator = async () => {
  return new Promise(resolve => {
    setTimeout(resolve, 5000)
  })
}

describe('Google', () => {
  it('should search for something', async () => {
    await timeoutGenerator();
    assert.equal(-1, [1,2,3].indexOf(0))
  })
})
