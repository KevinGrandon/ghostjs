import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('Returns after a network issue', () => {
  before(localServer)
  after(localServer.stop)

  it('hits a connection refused and doesnt time out', async () => {
    let flag;
    const raceServerResponse = setTimeout(() => {
      // If this setTimeout beat the error response, we're waiting too long
      flag = false
    }, 90000)
    await ghost.open('http://localhost:8888/longTime').then(() => {
      // If the response succeeded without an error, then this test is no longer valuable.
      flag = false
    }, function(err) {
      console.log(err)
      flag = true
    })
    clearTimeout(raceServerResponse)
    assert.ok(flag)
  })
})
