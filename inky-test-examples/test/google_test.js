import 'babel-polyfill'
import Inky from 'inky'

var assert = require('assert')

describe('Google', () => {
  it('has a title', async () => {
    var inky = new Inky();
    await inky.open('http://google.com')
    let pageTitle = await inky.pageTitle()
    assert.equal(pageTitle, 'Google')
  })
})
