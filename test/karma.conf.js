'use strict';

module.exports = function(config){
  config.set({

    basePath : '../',

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

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['PhantomJS'],


    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });

};