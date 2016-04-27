require('babel-polyfill')
require('babel-core/register')({
  // Ignore everything in node_modules except node_modules/ghostjs.
  ignore: /node_modules\/(?!ghostjs)/
})
