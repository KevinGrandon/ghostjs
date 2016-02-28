import assert from 'assert'
import ghost from 'ghostjs'
import localServer from './fixtures/server.js'
import fs from 'fs'

describe('HTTPS server', () => {

  let serverConfig = {
    port: 9443,
    tls: {
      key:  fs.readFileSync(__dirname + '/fixtures/ssl.key'),
      cert: fs.readFileSync(__dirname + '/fixtures/ssl.crt')
    }
  }

  before(localServer.bind(localServer, serverConfig))
  after(localServer.stop)

  const URL = 'https://localhost:9443/basic_content.html'
  it('does not have a signed cert', async () => {
    ghost.setDriverOpts({})
    let result = await ghost.open(URL)
    assert.equal(result, 'fail')
    ghost.exit()
  })
  if (ghost.testRunner.match(/phantom/)) {
    it('has a title', async () => {
      // Only works with PhantomJS, at present
      ghost.setDriverOpts({ parameters: { 'ignore-ssl-errors': 'yes' }})
      let result = await ghost.open(URL)
      assert.notEqual(result, 'fail')
      let pageTitle = await ghost.pageTitle()
      assert.ok(pageTitle.match(/Basic/))
      ghost.exit()
    })
  }
})
