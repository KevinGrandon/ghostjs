import 'babel-polyfill'
import inky from 'inky'

var assert = require('assert')

describe('Google', () => {
  it('has a title', async () => {
    await inky.open('http://google.com')
    let pageTitle = await inky.pageTitle()
    assert.equal(pageTitle, 'Google')
  })
})
