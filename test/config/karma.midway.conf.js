'use strict';

var settings = require('./common/common.conf');

module.exports = function(config) {

    config.set({

        basePath : settings.basePath,

        files : settings.filesForMidwayTests(),

        frameworks: settings.frameworks,

        reporters: ['progress', 'notify'],

        browsers : ['PhantomJS'],
    });

};