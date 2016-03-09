(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.serverPush
     * @description
     * This module handles server data communication when it pushes them to the client
     * exposing the factory WebSocketFactory, which is an API for instantiating sockets
     * that are integrated with Angular's digest cycle.
     *
     * Using WebSockets is a modern, bidirectional protocol that enables an interactive communication
     * session between the browser and a server. Its main current drawback is
     * that implementation is generally only available in the latest browsers.
     *
     * @requires  appverse.configuration
     */
    angular.module('appverse.serverPush', ['appverse.configuration'])

    .run(function ($log) {
        $log.info('appverse.serverPush run');
    });

})();
