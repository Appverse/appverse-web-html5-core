/*jshint node:true */

'use strict';

var settings = {

    basePath: '../../',

    frameworks: ['mocha', 'chai', 'sinon'],

    commonFiles: [
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
};


function Configurator() {
    this._files = [];
    this.basePath = settings.basePath;
    this.frameworks = settings.frameworks;
}

Configurator.prototype.filesForUnitTests = function() {
    return this.withCommonFiles().files(settings.unitFiles);
};

Configurator.prototype.withCommonFiles = function() {
    this._files = settings.commonFiles;
    return this;
};

Configurator.prototype.files = function(specificFiles) {
    return this._files.concat(specificFiles);
};

module.exports = new Configurator();
