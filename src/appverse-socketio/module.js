(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.socket.io
     * @description
     * Private module implementing SocketIO. It provides the common API module appverse.serverPush
     * with the socket object wrapping the SocketIO client. This is initializated according
     * to the pre-existing external configuration.
     *
     * @requires  appverse.configuration
     */
    angular.module('appverse.socket.io', ['appverse.configuration']);

})();