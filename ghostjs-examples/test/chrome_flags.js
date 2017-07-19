import assert from 'assert';
import ghost, { getChromeFlags } from 'ghostjs';

describe('Chrome flags are part of assembled arguments passed to spawn', () => {
  it ('Takes longer to load a page on a slower connection', async () => {
    if (ghost.testRunner.match(/chrome/) && process.env.CHROME_FLAGS) {
      assert.equal(JSON.stringify(getChromeFlags()), JSON.stringify(['--jesstest=true']))
    }
  })
})
