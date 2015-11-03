/*jshint node:true */

'use strict';

module.exports = function(config) {

    config.set({

        basePath: '../../',

        frameworks: ['jasmine'],

        browsers: ['PhantomJS'],

        reporters: ['progress', 'coverage', 'notify', 'junit'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            'src/appverse*/*.js': ['coverage']
        },

        coverageReporter: {
            // specify a common output directory
            dir: 'reports/coverage',
            reporters: [{
                    type: 'lcov'
                }, {
                    type: 'clover'
                },

            ]
        },

        junitReporter: {
            outputFile: 'reports/junit-test-results.xml'
        },

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-cookies/angular-cookies.js',
            'bower_components/angular-mocks/angular-mocks.js',
            'bower_components/angular-translate/angular-translate.js',
            'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
            'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
            'src/appverse-*/**/module.js',
            // Detection providers need to be loaded in this order
            'src/appverse-detection/mobile-detector.provider.js',
            'src/appverse-detection/detection.provider.js',
            // The rest
            'src/appverse-*/**/*.provider.js',
            'src/appverse-*/**/*.js',

            'src/appverse/*.js'
        ],

        unitFiles: [
            'test/unit/**/*.js'
        ]
    });
};
