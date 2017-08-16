function getChromeFlags () {
  let args = []
  if (process.env.CHROME_FLAGS) {
    const chromeFlags = process.env.CHROME_FLAGS.split(',')
    args = args.concat(chromeFlags)
  }
  return args
}

module.exports = { getChromeFlags }
