'use strict';

// Configure protractor to run e2e tests
// and generate reports

var settings = require('./common/protractor.conf');

settings.specs = [
    'test/e2e/**/*.js',
];

settings.baseUrl = 'http://localhost:9091/';

// Add junit reporting
settings.onPrepare = function () {
  require('jasmine-reporters');
  var capsPromise = browser.getCapabilities();
  capsPromise.then(function (caps) {
      var browserName = caps.caps_.browserName.toUpperCase();
      var browserVersion = caps.caps_.version;
      var prePendStr = 'e2e-test-results-' + browserName + "-" + browserVersion + "-";
      jasmine.getEnv().addReporter(new jasmine.JUnitXmlReporter("reports/junit", true, true, prePendStr));
  });
};

exports.config = settings;
