'use strict';

var settings = {

    basePath : '../../',

    frameworks: ['mocha', 'chai', 'sinon'],

    commonFiles : [
        'src/bower_components/angular/angular.js',
        'src/bower_components/angular-route/angular-route.js',
        'src/bower_components/angular-cookies/angular-cookies.js',
        'src/bower_components/angular-resource/angular-resource.js',
        'src/bower_components/angular-mocks/angular-mocks.js',
        'src/bower_components/angular-translate/angular-translate.js',
        'src/bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
        'src/bower_components/angular-dynamic-locale/src/tmhDynamicLocale.js',
        'src/modules/**/*.js',
    ],

    unitFiles : [
        'test/unit/**/*.js'
    ],

    midwayFiles : [
        'src/bower_components/angular-load/angular-load.js',
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

