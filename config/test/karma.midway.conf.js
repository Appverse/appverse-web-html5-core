'use strict';

var settings = require('./common/karma.conf');

module.exports = function(config) {

    config.set({

        basePath : settings.basePath,

        files : settings.filesForMidwayTests(),

        frameworks: settings.frameworks,

        reporters: ['progress', 'notify', 'coverage', 'junit'],

        browsers : ['PhantomJS'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/appverse*/*.js': ['coverage']
        },

        coverageReporter: {
          // specify a common output directory
            dir: 'reports/coverage/midway',
              reporters: [
                // reporters not supporting the `file` property
                { type: 'html'},
                { type: 'clover'},

            ]
        },

        junitReporter: {
          outputFile: 'reports/junit/midway-test-results.xml',
          suite: ''
        }
    });

};