(function() {
    'use strict';

    angular.module('appverse.serverPush')

    /**
     * @ngdoc service
     * @name appverse.serverPush.factory:WebSocketService
     * @requires $log
     * @requires $window
     * @requires WEBSOCKETS_CONFIG
     *
     * @description
     */
    .factory('WebSocketFactory', ['$log', 'WEBSOCKETS_CONFIG',
        function($log, WEBSOCKETS_CONFIG) {
            var factory = {};

            /**
                @ngdoc method
                @name appverse.serverPush.factory:WebSocketFactory#connect
                @methodOf appverse.serverPush.factory:WebSocketFactory
                @param {string} itemId The id of the item
                @description Establishes a connection to a swebsocket endpoint.
            */
            factory.connect = function(url) {

                if(factory.ws) {
                    return;
                }

                var ws;
                if ('WebSocket' in window) {
                    ws = new WebSocket(url);
                } else if ('MozWebSocket' in window) {
                    ws = new window.MozWebSocket(url);
                }
                ws.onopen = function () {
                    if (ws !== null) {
                        ws.send('');
                        factory.callback(WEBSOCKETS_CONFIG.WS_CONNECTED);
                    } else {
                        factory.callback(WEBSOCKETS_CONFIG.WS_DISCONNECTED);
                     }
                };

                ws.onerror = function() {
                  factory.callback(WEBSOCKETS_CONFIG.WS_FAILED_CONNECTION);
                };

                ws.onmessage = function(message) {
                  factory.callback(message.data);
                };

                ws.onclose = function () {
                    if (ws != null) {
                        ws.close();
                        ws = null;
                    }
                };

                factory.ws = ws;
            };

            /**
                @ngdoc method
                @name appverse.serverPush.factory:WebSocketFactory#send
                @methodOf appverse.serverPush.factory:WebSocketFactory
                @param {object} message Message payload in JSON format.
                @description Send a message to the ws server.
            */
            factory.send = function(message) {
              $log.debug('factory.ws: ' + factory.ws);
              factory.ws.send(message);
            };
            /**
                @ngdoc method
                @name appverse.serverPush.factory:WebSocketFactory#subscribe
                @methodOf appverse.serverPush.factory:WebSocketFactory
                @param {object} callback .
                @description Retrieve the currentcallback of the endpoint connection.
            */
            factory.subscribe = function(callback) {
              factory.callback = callback;
            };

            /**
                @ngdoc method
                @name appverse.serverPush.factory:WebSocketFactory#disconnect
                @methodOf appverse.serverPush.factory:WebSocketFactory
                @param {string} itemId The id of the item
                @description Close the WebSocket connection.
            */
            factory.disconnect = function() {
                factory.ws.close();
            };



             /**
                @ngdoc method
                @name appverse.serverPush.factory:WebSocketFactory#status
                @methodOf appverse.serverPush.factory:WebSocketFactory
                @param {string} itemId The id of the item
                @description WebSocket connection status.
            */
            factory.status = function() {
                if (factory.ws == null || angular.isUndefined(factory.ws)){
                    return WebSocket.CLOSED;
                }
                return factory.ws.readyState;
            };

            /**
                @ngdoc method
                @name appverse.serverPush.factory:WebSocketFactory#statusAsText
                @methodOf appverse.serverPush.factory:WebSocketFactory
                @param {string} itemId The id of the item
                @description Returns WebSocket connection status as text.
            */
            factory.statusAsText = function() {
                        var readyState = factory.status();
                        if (readyState == WebSocket.CONNECTING){
                                return WEBSOCKETS_CONFIG.CONNECTING;
                        } else if (readyState == WebSocket.OPEN){
                                return WEBSOCKETS_CONFIG.OPEN;
                        } else if (readyState == WebSocket.CLOSING){
                                return WEBSOCKETS_CONFIG.WS_CLOSING;
                        } else if (readyState == WebSocket.CLOSED){
                                return WEBSOCKETS_CONFIG.WS_CLOSED;
                        } else {
                                return WEBSOCKETS_CONFIG.WS_UNKNOWN;
                        }
            };


            return factory;
    }]);


})();