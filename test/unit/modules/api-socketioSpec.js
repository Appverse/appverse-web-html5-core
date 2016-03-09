/*jshint expr:true, node:true */

"use strict";

describe('Unit: Testing appverse.socketio module', function () {

    beforeEach(module('appverse.socketio'));

    it('should contain a SocketFactory factory', inject(function (SocketFactory) {
        expect(SocketFactory).to.be.an.object;
    }));

});