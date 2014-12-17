/*jshint expr:true */
"use strict";

describe('Unit: Testing AppLogging module', function () {

    describe('when server logging is active...', function() {

        var $httpBackend;

        beforeEach('mock constants', module(function($provide) {
            $provide.constant('LOGGING_CONFIG', {
                ServerEnabled : true,
                LogServerEndpoint : 'http://logginserver.com/log',
                EnabledDebugLevel: true,
                LogDateTimeFormat: '%Y-%M-%d %h:%m:%s:%z',
                CustomLogPreffix: 'APPLOG',
            });
        }));

        beforeEach('push module for injection', module('AppLogging'));

        beforeEach('inject fake backend', inject(function($injector) {
            // Set up the mock http service responses
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.expectPOST('http://logginserver.com/log', /\{.+\}/).respond(201, 'ok');
        }));

        it('should POST log data to the server', inject(function($log) {
            //$httpBackend.flush();
            $log.reset();
            $log.debug('anything');
            $httpBackend.flush();

        }));

        afterEach(function() {
           $httpBackend.verifyNoOutstandingExpectation();
           $httpBackend.verifyNoOutstandingRequest();
        });

    });

});
