'use strict';

var settings = {

    basePath : '../../',

    files : [
        'src/bower_components/jquery/dist/jquery.min.js',
        'src/bower_components/angular/angular.js',
        'src/bower_components/angular-route/angular-route.js',
        'src/bower_components/angular-cookies/angular-cookies.js',
        'src/bower_components/angular-resource/angular-resource.js',
        'src/bower_components/angular-mocks/angular-mocks.js',
        'src/bower_components/angular-translate/angular-translate.js',
        'src/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        'src/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
        'src/modules/**/*.js',
        'test/unit/**/*.js'
    ],

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],
};

///// Return function to manage these settings

var coverageSettings = require('./coverage.conf');

function UnitTestingConfig() {

    var coverageReportEnabled = false;

    var enableCoverageReport = function() {
        coverageReportEnabled = true;
    };

    var getSettings = function() {
        if (coverageReportEnabled) {
            addSettings(coverageSettings);
        }
        return settings;
    };

    var addSettings = function(settingsObject) {
        for(var key in settingsObject) {
            if (settingsObject.hasOwnProperty(key)) {
                settings[key] = settingsObject[key];
            }
        }
    };

    return {
        enableCoverageReport : enableCoverageReport,
        getSettings : getSettings,
        addSettings : addSettings
    };


}

module.exports = UnitTestingConfig();
