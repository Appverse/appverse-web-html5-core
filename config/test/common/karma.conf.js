'use strict';

var settings = {

    basePath : '../../',

    frameworks: ['mocha', 'chai', 'sinon'],

    commonFiles : [
        'bower_components/angular/angular.js',
        'bower_components/angular-route/angular-route.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/angular-resource/angular-resource.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'bower_components/angular-translate/angular-translate.js',
        'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        'bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
        'src/api-*/**/module.js',
        // Detection providers need to be loaded in this order
        'src/api-detection/mobile-libraries-loader.provider.js',
        'src/api-detection/mobile-detector.provider.js',
        'src/api-detection/detection.provider.js',
        // The rest
        'src/api-*/**/*.provider.js',
        'src/api-*/**/*.js',
    ],

    unitFiles : [
        'test/unit/**/*.js'
    ],

    midwayFiles : [
        'bower_components/angular-load/angular-load.js',
        'bower_components/angular-cache/dist/angular-cache.js',
        'bower_components/angular-ui-router/release/angular-ui-router.js',
        'bower_components/lodash/dist/lodash.js',
        'bower_components/restangular/dist/restangular.js',
        'test/midway/**/*.js'
    ],
};


function Configurator () {
    this._files = [];
    this.basePath = settings.basePath;
    this.frameworks = settings.frameworks;
}

Configurator.prototype.filesForUnitTests = function () {
    return this.withCommonFiles().files(settings.unitFiles);
};

Configurator.prototype.filesForMidwayTests = function () {
    return this.withCommonFiles().files(settings.midwayFiles);
};

Configurator.prototype.withCommonFiles = function () {
    this._files = settings.commonFiles;
    return this;
};

Configurator.prototype.files = function (specificFiles) {
    return this._files.concat(specificFiles);
};

module.exports = new Configurator();

