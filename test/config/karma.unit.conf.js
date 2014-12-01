'use strict';

var settings = require('./common/common.conf');

module.exports = function(config) {

    config.set({

        basePath : settings.basePath,

        files : settings.filesForUnitTests(),

        frameworks: settings.frameworks,

        browsers : ['PhantomJS'],

        reporters: ['progress', 'coverage', 'notify'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/directives/*.js': ['coverage'],
            'src/modules/*.js': ['coverage'],
        },

        coverageReporter: {
          type : 'html',
          dir : 'coverage/'
        }
    });

};