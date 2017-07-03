import ghost from 'ghostjs';
import assert from 'assert';

import localServer from './fixtures/server.js';

describe('ghost#fill', () => {

  before(localServer)
  after(localServer.stop)

  it('fills the form', async () => {
    await ghost.open('http://localhost:8888/form.html')

    // input[type=text]
    let emptyInput = await ghost.findElement('#emptyInput')
    assert.equal(await emptyInput.getAttribute('value'), '')
    await ghost.fill('#emptyInput', 'text input filled')
    assert.equal(await emptyInput.getAttribute('value'), 'text input filled')

    // input[type=text] (filled)
    await ghost.fill('#emptyInput', '')
    assert.equal(await emptyInput.getAttribute('value'), '')

    // textarea
    let emptyTextarea = await ghost.findElement('#emptyTextarea')
    assert.equal(await emptyTextarea.getAttribute('value'), '')
    await ghost.fill('#emptyTextarea', 'textarea filled')
    assert.equal(await emptyTextarea.getAttribute('value'), 'textarea filled')

    // checkboxes
    let firstCheckbox = await ghost.findElement('#checkbox1')
    let secondCheckbox = await ghost.findElement('#checkbox2')
    assert.equal(await firstCheckbox.getAttribute('checked'), false)
    assert.equal(await secondCheckbox.getAttribute('checked'), false)
    await ghost.fill('#checkbox2', true)
    assert.equal(await firstCheckbox.getAttribute('checked'), false)
    assert.equal(await secondCheckbox.getAttribute('checked'), true)

    // radios
    let firstRadio = await ghost.findElement('#radio1')
    let secondRadio = await ghost.findElement('#radio2')
    assert.equal(await firstRadio.getAttribute('checked'), false)
    assert.equal(await secondRadio.getAttribute('checked'), false)
    await ghost.fill('#radio1', true)
    assert.equal(await firstRadio.getAttribute('checked'), true)
    assert.equal(await secondRadio.getAttribute('checked'), false)

    // select
    let singleSelect = await ghost.findElement('#singleSelect')
    assert.equal(await singleSelect.getAttribute('value'), '1')
    await ghost.fill('#singleSelect', 'Second Value');
    assert.equal(await singleSelect.getAttribute('value'), '2')

    // multiple
    let multiSelect = await ghost.findElement('#multiSelect')
    await ghost.fill('#multiSelect', ['one', 'two'])
    // Verbose, we can make a helper if anyone does this.
    var selected = await multiSelect.script((el) => {
      var selected = []
      for (var i = 0; i < el.options.length; i++) {
        if (el.options[i].selected) {
          selected.push(el.options[i].value)
        }
      }
      return selected
    })
    assert.deepEqual([1, 2], selected)
  })
})
