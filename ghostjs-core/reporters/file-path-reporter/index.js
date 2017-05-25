var mocha = require('mocha');

function MyReporter(runner) {
  mocha.reporters.Base.call(this, runner);
  var passes = 0;
  var failures = 0;

  runner.on('pass', function(test){
    console.log("WE PASSED A TEST");
    passes++;
    console.log('pass: %s', test.fullTitle());
  });

  runner.on('fail', function(test, err){
    failures++;
    console.log('fail: %s -- error: %s', test.fullTitle(), err.message);
  });

  runner.on('end', function(){
    console.log('end: %d/%d', passes, passes + failures);
    process.exit(failures);
  });
}

module.exports = MyReporter;
