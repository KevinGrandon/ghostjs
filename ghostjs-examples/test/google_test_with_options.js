import ghost from 'ghost';
import assert from 'assert';  

decribe('Ghost', () => { 
  it('Loads chrome, even with options being set', async () => { 
    const options = {
      settings: {
        firstOption: true,
        secondOption: false,
      },
      viewportSize: {
        width: 1200,
        height: 900,
      },
      headers: {
        'some-header': 'blah',
      },
    }

    await ghost.open('http://google.com', options)
    const pageTitle = await ghost.pageTitle()
    assert.equal(pageTitle, 'Google')
  });
}