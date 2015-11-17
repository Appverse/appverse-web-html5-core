/*jshint expr:true, node:true */
"use strict";

describe('Unit: Testing appverse.logging module', function () {

    describe('when server logging is active...', function () {

        var $httpBackend;

        beforeEach(function () {
            module('appverse.logging');

            AppInit.setConfig({
                environment: {
                    LOGGING_CONFIG: {
                        ServerEnabled: true,
                        LogServerEndpoint: 'http://logginserver.com/log'
                    }
                }
            });
        });

        beforeEach('inject fake backend', inject(function ($injector) {
            // Set up the mock http service responses
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.whenPOST('http://logginserver.com/log', /\{.+\}/).respond(201, 'ok');
        }));

        it('should POST log data to the server', inject(function ($log) {
            $log.reset();
            $log.debug('anything');
            $httpBackend.flush();
        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

    });

});
