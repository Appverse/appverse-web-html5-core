'use strict';

var UnitTestingConfig = require('./common/unit.conf.js');

module.exports = function(config) {

    var settings = UnitTestingConfig.getSettings();

    settings.autoWatch = true;

    config.set(settings);

};