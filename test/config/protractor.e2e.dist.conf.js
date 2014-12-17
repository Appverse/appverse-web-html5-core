'use strict';

// Configure protractor to run e2e tests on 'dist' code

var settings = require('./common/protractor.conf');

settings.specs = [
    '../e2e/*.js'
];

settings.baseUrl = 'http://localhost:9090/';

exports.config = settings;
