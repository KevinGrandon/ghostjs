module.exports = function(config) {
  config.set({
    browsers: ['Firefox'],
    files: [
      'test/*_test.js'
    ],
    frameworks: ['browserify'],
    preprocessors: {
      'test/*.js': ['browserify', 'babel']
    },
    babelPreprocessor: {
      options: {
        presets: ['es2015', 'stage-0'],
        sourceMap: 'inline'
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    }
  })
}
