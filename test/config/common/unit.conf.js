'use strict';

var settings = {

    basePath : '../../',

    files : CommonTestConfig.files.push('test/unit/**/*.js'),

    frameworks: ['mocha', 'chai', 'sinon'],

    reporters: ['progress', 'notify'],

    browsers : ['PhantomJS'],
};


