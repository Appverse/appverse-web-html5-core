/*jshint expr:true */

"use strict";

describe('Unit: Testing appverse.serverPush module', function () {

    beforeEach(setupServerPushTesting);

    it('should contain a SocketFactory factory',  inject(function (SocketFactory) {
        expect(SocketFactory).to.be.an.object;
    }));

    /////////////// HELPER FUNCTIONS

    function setupServerPushTesting() {

        // Generate mock modules and providers
        mockDependencies();

        // Load the module to be tested and initialized a mocked socketIo
        module('appverse.serverPush', function(socketProvider) {
            socketProvider.ioSocket({
                on : sinon.spy()
            });
        });
    }

    function mockDependencies() {

        // Provide the dependency injector with mock empty objects
        // instead of real ones
        module(function ($provide) {
            $provide.constant('SERVERPUSH_CONFIG', {});
        });
    }
});
