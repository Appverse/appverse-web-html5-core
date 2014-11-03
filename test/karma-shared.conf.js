"use strict";

module.exports = function () {
    return {
        basePath: '../',
        frameworks: ['mocha'],

        // coverage reporter generates the coverage
        reporters: ['progress', 'coverage'],

        preprocessors: {
            // source files, that you wanna generate coverage for
            // do not include tests or libraries
            // (these files will be instrumented by Istanbul)
            //            'app/scripts/{*!(api)/*.js,!(app).js}': 'coverage'
            'app/scripts/**/*.js': 'coverage'
        },

        // optionally, configure the reporter
        coverageReporter: {
            type: 'lcov',
            dir: 'test/coverage/'
        },

        browsers: ['PhantomJS'],
        autoWatch: true,

        // these are default values anyway
        singleRun: false,
        colors: true,

        files: [

            //3rd Party Code
            'src/bower_components/jquery/dist/jquery.min.js',
            'src/bower_components/angular/angular.min.js',
            'src/bower_components/angular-cookies/angular-cookies.min.js',
            'src/bower_components/angular-sanitize/angular-sanitize.min.js',
            'src/bower_components/angular-ui-router/release/angular-ui-router.min.js',
            'src/bower_components/angular-cache/dist/angular-cache.min.js',
            'src/bower_components/angular-resource/angular-resource.min.js',
            'src/bower_components/ng-grid/build/ng-grid.debug.js',
            'src/bower_components/socket.io-client/dist/socket.io.min.js',
//            'http://cdnjs.cloudflare.com/ajax/libs/socket.io/0.9.16/socket.io.min.js',

            //App-specific Code
            'src/bower_components/lodash/dist/lodash.underscore.min.js',
            'src/bower_components/restangular/dist/restangular.min.js',

            'src/bower_components/appverse-web-html5-core/src/modules/api-cache.js',
            'src/bower_components/appverse-web-html5-core/src/modules/api-configuration.js',
            'src/bower_components/appverse-web-html5-core/src/modules/api-detection.js',
 //            'src/scripts/api/modules/api-logging.js',
            'src/bower_components/appverse-web-html5-core/src/modules/api-main.js',

            'src/bower_components/lodash/dist/lodash.underscore.min.js',
            'src/bower_components/restangular/dist/restangular.min.js',
            'src/bower_components/appverse-web-html5-core/src/modules/api-rest.js',

            'src/bower_components/appverse-web-html5-security/src/modules/api-security.js',

            'src/bower_components/appverse-web-html5-core/src/modules/api-serverpush.js',

            'src/bower_components/appverse-web-html5-core/src/modules/api-translate.js',
            'src/bower_components/angular-translate/angular-translate.min.js',
            'src/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
            'src/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',

            'src/bower_components/appverse-web-html5-core/src/modules/api-performance.js',

            'src/bower_components/appverse-web-html5-core/src/modules/api-utils.js',

            'src/bower_components/appverse-web-html5-core/src/directives/*.js',
            'src/bower_components/appverse-web-html5-security/src/directives/*.js',
            'src/scripts/app.js',
            'src/scripts/controllers/*.js',
            'src/scripts/factories/*.js',
            'src/scripts/states/*.js',

            //Test-Specific Code
            'node_modules/chai/chai.js',
            'test/lib/chai-should.js',
            'test/lib/chai-expect.js'
        ]
    };
};
