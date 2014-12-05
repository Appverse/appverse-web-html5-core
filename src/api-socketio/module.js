(function() {
    'use strict';

    //////////////////////////////////////////////////////////////////////////////
    // COMMON API - 0.1
    // PRIVATE MODULE (AppSocketIO)
    ////////////////////////////////////////////////////////////////////////////

    /**
     * @ngdoc module
     * @name AppSocketIO
     * @description
     * Private module implementing SocketIO. It provides the common API module AppServerpush
     * with the socket object wrapping the SocketIO client. This is initializated according
     * to the pre-existing external configuration.
     */
    angular.module('AppSocketIO', ['AppConfiguration'])

})();