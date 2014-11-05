'use strict';

var UnitTestingConfig = require('./common/unit.conf.js');

module.exports = function(config) {

    UnitTestingConfig.enableCoverageReport();

    var settings = UnitTestingConfig.getSettings();

    config.set(settings);

};