/*jshint node:true */

'use strict';

module.exports = function (config) {

    config.set({

        basePath: '../..',

        frameworks: ['mocha', 'chai', 'sinon'],

        browsers: ['PhantomJS_custom'],

        // you can define custom flags
        customLaunchers: {
            'PhantomJS_custom': {
                base: 'PhantomJS2',
                options: {
                    windowName: 'my-window',
                    settings: {
                        webSecurityEnabled: false
                    }
                },
                flags: ['--load-images=true', '--local-to-remote-url-access=true'],
                debug: true
            }
        },

        phantomjsLauncher: {
            // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
            exitOnResourceError: true
        },

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
            }]
        },

        junitReporter: {
            outputFile: 'reports/junit-test-results.xml'
        },

        files: [
            'bower_components/angular/angular.js',
            'bower_components/angular-cache/dist/angular-cache.min.js',
            'bower_components/angular-translate/angular-translate.min.js',
            'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
            'bower_components/angular-dynamic-locale/dist/tmhDynamicLocale.js',
            'bower_components/sockjs-client/dist/sockjs.js',
            'bower_components/stomp-websocket/lib/stomp.min.js',

            'src/appverse-*/**/module.js',
            // Detection providers need to be loaded in this order
            'src/appverse-detection/mobile-detector.provider.js',
            'src/appverse-detection/detection.provider.js',
            // The rest
            'src/**/*.js',

            'bower_components/angular-mocks/angular-mocks.js',
            'test/unit/**/*.js'
        ]

    });
};
