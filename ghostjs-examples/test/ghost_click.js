import ghost from 'ghostjs'
import assert from 'assert'; 

import localServer from './fixtures/server.js'

describe('ghost#click', () => {
  before(localServer)
  after(localServer.stop)

  it ('Properly clicks on an element', async () => { 
    await ghost.open('http://localhost:8888/basic_content.html');

    await ghost.click('#formLink');
    await ghost.waitForPageTitle('Form');
  });
});