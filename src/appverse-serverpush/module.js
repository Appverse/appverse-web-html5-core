(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.serverPush
     * @description
     * This module handles server data communication when it pushes them to the client
     * exposing the factory SocketFactory, which is an API for instantiating sockets
     * that are integrated with Angular's digest cycle.
     * It is now based on SocketIO (http://socket.io/). Why?
     *
     * Using WebSockets is a modern, bidirectional protocol that enables an interactive communication
     * session between the browser and a server. Its main current drawback is
     * that implementation is generally only available in the latest browsers. However, by
     * using Socket.IO, this low level detail is abstracted away and we, as programmers,
     * are relieved of the need to write browser-specific code.
     *
     * The current release of socket.io is 0.9.10.
     *
     * The module appverse.serverPush is included in the main module.
     *
     * The private module appverse.socket.io simply wraps SocketIO API to be used by appverse.serverPush.
     *
     * So, appverse.serverPush is ready to integrate other Server Push approaches (e.g. Atmosphere) only by including
     * a new module and injecting it to appverse.serverPush.
     *
     *
     * NOTE ABOUT CLIENT DEPENDENCIES WITH SOCKET.IO
     *
     * The Socket.IO server will handle serving the correct version of the Socket.IO client library;
     *
     * We should not be using one from elsewhere on the Internet. From the top example on http://socket.io/:
     *
     *  <script src="/socket.io/socket.io.js"></script>
     *
     * This works because we wrap our HTTP server in Socket.IO (see the example at How To Use) and it intercepts
     * requests for /socket.io/socket.io.js and sends the appropriate response automatically.
     *
     * That is the reason it is not a dependency handled by bower.
     *
     * @requires  appverse.socket.io
     * @requires  appverse.configuration
     */
    angular.module('appverse.serverPush', ['appverse.configuration'])

    .run(function ($log) {
        $log.info('appverse.serverPush run');
    });

})();