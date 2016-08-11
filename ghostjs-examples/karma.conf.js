module.exports = function(config) {
  config.set({
    browsers: ['Firefox'],
    files: [
      'test/*_test.js'
    ],
    preprocessors: {
      'src/**/*.js': ['babel'],
      'test/*.js': ['babel']
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
