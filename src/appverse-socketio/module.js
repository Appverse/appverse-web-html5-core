(function() {
    'use strict';

    //////////////////////////////////////////////////////////////////////////////
    // COMMON API - 0.1
    // PRIVATE MODULE (appverse.socket.io)
    ////////////////////////////////////////////////////////////////////////////

    /**
     * @ngdoc module
     * @name appverse.socket.io
     * @description
     * Private module implementing SocketIO. It provides the common API module AppServerpush
     * with the socket object wrapping the SocketIO client. This is initializated according
     * to the pre-existing external configuration.
     */
    angular.module('appverse.socket.io', ['AppConfiguration']);

})();