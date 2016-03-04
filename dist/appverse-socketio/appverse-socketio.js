(function () {
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
    angular.module('appverse.socketio', ['appverse.configuration']);

})();
(function () {
    'use strict';

    angular.module('appverse.socketio')

    /**
     * @ngdoc service
     * @name SocketFactory
     * @module appverse.serverPush
     * @description
     * Although Socket.IO exposes an io variable on the window, it's better to encapsulate it
     * into the AngularJS's Dependency Injection system.
     * So, we'll start by writing a factory to wrap the socket object returned by Socket.IO.
     * This will make easier to test the application's controllers.
     * Notice that the factory wrap each socket callback in $scope.$apply.
     * This tells AngularJS that it needs to check the state of the application and update
     * the templates if there was a change after running the callback passed to it by using dirty checking.
     * Internally, $http works in the same way. After some XHR returns, it calls $scope.$apply,
     * so that AngularJS can update its views accordingly.
     *
     * @requires https://docs.angularjs.org/api/ng/service/$rootScope $rootScope
     * @requires Socket
     */
    .factory('SocketFactory',
        ["$rootScope", "Socket", function ($rootScope, Socket) {
            var factory = {};

            /**
                 @ngdoc method
                 @name SocketFactory#listen
                 @param {string} eventName The name of the event/channel to be listened
                 The communication is bound to rootScope.
                 @param {object} callback The function to be passed as callback.
                 @description Establishes a communication listening an event/channel from server.
                 Use this method for background communication although the current scope is destyroyed.
                 You should cancel communication manually or when the $rootScope object is destroyed.
                 */
            factory.listen = function (eventName, callback) {
                Socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(Socket, args);
                    });
                });
            };

            /**
                 @ngdoc method
                 @name SocketFactory#sendMessage
                 @param {string} eventName The name of the event/channel to be sent to server
                 @param {object} scope The scope object to be bound to the listening.
                 The communication will be cancelled when the scope is destroyed.
                 @param {object} callback The function to be passed as callback.
                 @description Establishes a communication listening an event/channel from server.
                 It is bound to a given $scope object.
                 */
            factory.sendMessage = function (eventName, data, callback) {
                Socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(Socket, args);
                        }
                    });
                });
            };

            /**
                 @ngdoc method
                 @name SocketFactory#unsubscribeCommunication
                 @param {object} callback The function to be passed as callback.
                 @description Cancels all communications to server.
                 The communication will be cancelled without regarding other consideration.
                 */
            factory.unsubscribeCommunication = function (callback) {
                Socket.off(callback());
            };


            return factory;

        }]);

})();
(function () {
    'use strict';

    angular.module('appverse.socketio')

    /**
     * @ngdoc provider
     * @name Socket
     * @module appverse.socket.io
     * @description
     * This provider provides the appverse.serverPush module with the SocketIO
     * client object from pre-existing configuration in application.
     *
     * This object helps the common API module  making  easier to add/remove
     * listeners in a way that works with AngularJS's scope.
     *
     * socket.on / socket.addListener: Takes an event name and callback.
     * Works just like the method of the same name from Socket.IO.
     *
     * socket.removeListener: Takes an event name and callback.
     * Works just like the method of the same name from Socket.IO.
     *
     * socket.emit: sends a message to the server. Optionally takes a callback.
     * Works just like the method of the same name from Socket.IO.
     *
     * socket.forward: allows you to forward the events received by Socket.IO's socket to AngularJS's event system.
     * You can then listen to the event with $scope.$on.
     * By default, socket-forwarded events are namespaced with socket:.
     * The first argument is a string or array of strings listing the event names to be forwarded.
     * The second argument is optional, and is the scope on which the events are to be broadcast.
     * If an argument is not provided, it defaults to $rootScope.
     * As a reminder, broadcasted events are propagated down to descendant scopes.
     *
     * @requires SERVERPUSH_CONFIG
     */
    .provider('Socket',
        function () {

            var SERVERPUSH_CONFIG = angular.injector(['appverse.configuration.default']).get('SERVERPUSH_CONFIG');

            // when forwarding events, prefix the event name
            var prefix = 'socket:',
                ioSocket;

            // expose to provider
            this.$get = ["$rootScope", "$timeout", function ($rootScope, $timeout) {
                /* global io */

                /*
                Initialization of the socket object by using params in configuration module.
                Please read below for configuration detals:
                * Client configuration: https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#client
                * Server configuration: https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#server
                */
                var socket;

                if (ioSocket || window.io) {

                    socket = ioSocket || io.connect(
                        SERVERPUSH_CONFIG.BaseUrl, {
                            'resource': SERVERPUSH_CONFIG.Resource,
                            'connect timeout': SERVERPUSH_CONFIG.ConnectTimeout,
                            'try multiple transports': SERVERPUSH_CONFIG.TryMultipleTransports,
                            'reconnect': SERVERPUSH_CONFIG.Reconnect,
                            'reconnection delay': SERVERPUSH_CONFIG.ReconnectionDelay,
                            'reconnection limit': SERVERPUSH_CONFIG.ReconnectionLimit,
                            'max reconnection attempts': SERVERPUSH_CONFIG.MaxReconnectionAttempts,
                            'sync disconnect on unload': SERVERPUSH_CONFIG.SyncDisconnectOnUnload,
                            'auto connect': SERVERPUSH_CONFIG.AutoConnect,
                            'flash policy port': SERVERPUSH_CONFIG.FlashPolicyPort,
                            'force new connection': SERVERPUSH_CONFIG.ForceNewConnection
                        }
                    );
                }

                var asyncAngularify = function (callback) {
                    return function () {
                        var args = arguments;
                        $timeout(function () {
                            callback.apply(socket, args);
                        }, 0);
                    };
                };

                var addListener = function (eventName, callback) {
                    socket.on(eventName, asyncAngularify(callback));
                };

                var removeListener = function () {
                    socket.removeAllListeners();
                };


                var wrappedSocket = {
                    on: addListener,
                    addListener: addListener,
                    off: removeListener,

                    emit: function (eventName, data, callback) {
                        if (callback) {
                            socket.emit(eventName, data, asyncAngularify(callback));
                        } else {
                            socket.emit(eventName, data);
                        }
                    },

                    forward: function (events, scope) {
                        if (events instanceof Array === false) {
                            events = [events];
                        }
                        if (!scope) {
                            scope = $rootScope;
                        }
                        angular.forEach(events, function (eventName) {
                            var prefixed = prefix + eventName;
                            var forwardEvent = asyncAngularify(function (data) {
                                scope.$broadcast(prefixed, data);
                            });
                            scope.$on('$destroy', function () {
                                socket.removeListener(eventName, forwardEvent);
                            });
                            socket.on(eventName, forwardEvent);
                        });
                    }
                };

                return wrappedSocket;
            }];

            this.prefix = function (newPrefix) {
                prefix = newPrefix;
            };

            this.ioSocket = function (socket) {
                ioSocket = socket;
            };
        });


})();