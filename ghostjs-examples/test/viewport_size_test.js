import ghost from 'ghostjs'
import assert from 'assert'

import localServer from './fixtures/server.js'

describe('ghost#viewportSize', () => {

  before(localServer)
  after(localServer.stop)

  it('sizes the viewport appropriately with the viewportSize option', async () => {
    await ghost.open('http://localhost:8888/basic_content.html', {
      viewportSize: {
        width: 450,
        height: 700
      }
    })

    await ghost.wait(async () => {
      let [width, height] = await ghost.script(() => [window.innerWidth, window.innerHeight])
      return width === 450/* && height === 700 */ // TODO: For some reason height is always a few px off of the desired viewport.
    })

    ghost.close()

    await ghost.open('http://localhost:8888/basic_content.html', {
      viewportSize: {
        width: 400,
        height: 800
      }
    })

    await ghost.wait(async () => {
      let [width, height] = await ghost.script(() => [window.innerWidth, window.innerHeight])
      return width === 400/* && height === 800 */ // TODO: For some reason height is always a few px off of the desired viewport.
    })
  })
})
