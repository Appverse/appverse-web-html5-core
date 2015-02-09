(function() {
    'use strict';

    /**
    * @ngdoc module
    * @name AppServerPush
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
    * The module AppServerPush is included in the main module.
    *
    * The private module appverse.socket.io simply wraps SocketIO API to be used by AppServerPush.
    *
    * So, AppServerPush is ready to integrate other Server Push approaches (e.g. Atmosphere) only by including
    * a new module and injecting it to AppServerPush.
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
    */
    angular.module('AppServerPush', ['appverse.socket.io', 'AppConfiguration'])
    /*
         To make socket error events available across an app, in one of the controllers:

         controller('MyCtrl', function ($scope) {
             $scope.on('socket:error', function (ev, data) {
                ...
         });
         */
    .run(['$log',
        function ($log) {
            $log.info('AppServerPush run');
            //socket.forward('error');
        }]);

})();