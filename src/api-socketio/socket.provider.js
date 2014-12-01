(function() { 'use strict';

angular.module('AppSocketIO')

/**
 * @ngdoc provider
 * @name AppSocketIO.provider:socket
 * @description
 * This provider provides the appserverpush module with the SocketIO client object from pre-existing configuration in application.
 *
 * This object helps the common API module  making  easier to add/remove listeners in a way that works with AngularJS's scope.
 *
 * socket.on / socket.addListener: Takes an event name and callback. Works just like the method of the same name from Socket.IO.
 *
 * socket.removeListener: Takes an event name and callback. Works just like the method of the same name from Socket.IO.
 *
 * socket.emit: sends a message to the server. Optionally takes a callback.
 * Works just like the method of the same name from Socket.IO.
 *
 * socket.forward: allows you to forward the events received by Socket.IO's socket to AngularJS's event system.
 * You can then listen to the event with $scope.$on. By default, socket-forwarded events are namespaced with socket:.
 * The first argument is a string or array of strings listing the event names to be forwarded.
 * The second argument is optional, and is the scope on which the events are to be broadcast.
 * If an argument is not provided, it defaults to $rootScope.
 * As a reminder, broadcasted events are propagated down to descendant scopes.
 */
 .provider('socket', ['SERVERPUSH_CONFIG',
    function (SERVERPUSH_CONFIG) {

        // when forwarding events, prefix the event name
        var prefix = 'socket:',
            ioSocket;

        // expose to provider
        this.$get = function ($rootScope, $timeout) {

            /*
            Initialization of the socket object by using params in configuration module.
            Please read below for configuration detals:
            * Client configuration: https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#client
            * Server configuration: https://github.com/LearnBoost/Socket.IO/wiki/Configuring-Socket.IO#server
            */
            var socket = ioSocket || io.connect(
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

                //                removeListener: function () {
                //                    var args = arguments;
                //                    return socket.removeListener.apply(socket, args);
                //                },

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
        };

        this.prefix = function (newPrefix) {
            prefix = newPrefix;
        };

        this.ioSocket = function (socket) {
            ioSocket = socket;
        };
    }]);


})();