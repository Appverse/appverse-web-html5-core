/*jshint expr:true, node:true */

"use strict";

describe('Unit: Testing appverse.serverPush module', function() {

    var WebSocketFactory, $httpBackend;

    this.timeout(10000);

    beforeEach(module('appverse.serverPush'));

    beforeEach(inject(function(_WebSocketFactory_, _$httpBackend_) {
        WebSocketFactory = _WebSocketFactory_;
        $httpBackend = _$httpBackend_;

        expect(WebSocketFactory).to.be.an.object;
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should contain a SocketFactory factory', inject(function(SocketFactory) {
        expect(SocketFactory).to.be.an.object;
    }));

    it('should connect to a WebSocket connection ', function() {
        WebSocketFactory.connect('user', 'password', function() {
            expect(WebSocketFactory.client).to.be.defined;
        });
    });
});
