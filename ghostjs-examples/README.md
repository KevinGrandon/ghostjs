# ghostjs Test Examples

[![Dependency Status](https://david-dm.org/kevingrandon/ghostjs.svg?path=/ghostjs-examples/)](https://david-dm.org/kevingrandon/ghostjs?path=/ghostjs-examples/)

The test/ folder contains a list of tests that use ghostjs for integration tests. This is meant to be used as an example of how you can write tests with ghostjs.

## Test Suites

Our test suites ensure that we do not break any single test runner or environment. These are defined as script targets in package.json.

**test:slimerjs**

Ensures that tests pass against mocha and SlimerJS.

* Browser: SlimerJS
* Test Runner: Mocha
* Binary: ghostjs

**test:phantom**

Ensures that tests pass against the headless PhantomJS browser.

* Browser: PhantomJS
* Test Runner: Mocha
* Binary: ghostjs
