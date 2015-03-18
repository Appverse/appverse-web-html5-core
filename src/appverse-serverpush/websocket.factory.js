(function() {
    'use strict';

    angular.module('appverse.serverPush')

    /**
     * @ngdoc service
     * @name WebSocketService
     * @module appverse.serverPush
     *
     * @requires https://docs.angularjs.org/api/ngMock/service/$log $log
     * @requires WEBSOCKETS_CONFIG
     */
    .factory('WebSocketFactory', ['$log', 'WEBSOCKETS_CONFIG',
        function($log, WEBSOCKETS_CONFIG) {
            var factory = {};

            /**
                @ngdoc method
                @name WebSocketFactory#connect
                @param {string} itemId The id of the item
                @description Establishes a connection to a swebsocket endpoint.
            */
            factory.open = function(url) {

                if(factory.ws) {
                    return;
                }

                var ws = null;
                //check if SockJS is avaiable
                
                if (WEBSOCKETS_CONFIG.WS_TYPE === 'auto'){//auto|sockjs|native
                    if ('SockJS' in window) {
                        ws = new SockJS(url);                
                    }
                }else if (WEBSOCKETS_CONFIG.WS_TYPE === 'sockjs'){
                    ws = new SockJS(url);
                }
                //otherwise switches to HTML5 WebSocket native object
                if (ws === null){
                    $log.debug('WS_TYPE: native');
                    if ('WebSocket' in window) {
                        ws = new WebSocket(url);
                    } else if ('MozWebSocket' in window) {
                        ws = new MozWebSocket(url);
                    }
                }else{
                    $log.debug('WS_TYPE: sockjs');
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
                  factory.onmessagecallback(message.data);
                };

                ws.onclose = function () {
                    if (ws !== null) {
                        ws.close();
                        ws = null;
                    }
                };

                factory.ws = ws;
            };
            
            /**
                @ngdoc method
                @name WebSocketFactory#connect
                @param {object} username 
                @param {object} password 
                @param {object} onconnectcallback 
                @description Stablishes a protocol connection over a websocket connection
            */
            factory.connect = function(user, password, onconnectcallback) {
                if(factory.client) {
                    $log.warn('factory.client already exists: ' + factory.client + 'close it to reconect');
                    return;
                }
                if (WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'none'){
                    $log.warn('No protocol configured WS_PROTOCOL_TYPE=none');
                    return;
                }
                if (factory.ws === null){
                    $log.warn('No underling websocket connection stablished, ' +
                              'stablish a websocket connection first');
                    return;
                }
                var client = null;
                //protocol
                if (WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'auto' ||
                    WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'stomp'){
                    if ('Stomp' in window){
                        if (factory.ws !== null){
                            client = Stomp.over(factory.ws);
                        }else{
                            $log.warn('No underling websocket connection stablished, ' +
                                      'stablish a websocket connection first');
                            return;
                        }
                        $log.debug('WS_TYPE: sockjs');
                        //configure
                        if (WEBSOCKETS_CONFIG.WS_INTERVAL !== null){
                            client.heartbeat.outgoing = WEBSOCKETS_CONFIG.WS_INTERVAL * 1000;
                        }
                        //stablish connection
                        if (onconnectcallback !== undefined){
                            client.connect(user, password, onconnectcallback);  
                        }else{
                            client.connect(user, password, factory.onconnectcallback);
                        }
                    }else{
                        $log.debug('WS_TYPE: none');
                    }
                }
                factory.client = client;
            };

            /**
                @ngdoc method
                @name WebSocketFactory#send
                @param {object} message Message payload in JSON format.
                @description Send a message to the ws server.
            */
            factory.send = function(message) {
              $log.debug('factory.ws: ' + factory.ws);
              factory.ws.send(message);
            };
            /**
                @ngdoc method
                @name WebSocketFactory#subscribe
                @param {object} callback .
                @description Retrieve the currentcallback of the endpoint connection.
            */
            factory.onmessage = function(callback) {
              factory.onmessagecallback = callback;
            };
             factory.onstatuschanged = function(callback) {
              factory.callback = callback;
            };

            /**
                @ngdoc method
                @name WebSocketFactory#disconnect
                @param {string} itemId The id of the item
                @description Close the WebSocket connection.
            */
            factory.close = function() {
                factory.ws.close();
            };



             /**
                @ngdoc method
                @name WebSocketFactory#status
                @param {string} itemId The id of the item
                @description WebSocket connection status.
            */
            factory.status = function() {
                if (factory.ws === null || angular.isUndefined(factory.ws)){
                    return WebSocket.CLOSED;
                }
                return factory.ws.readyState;
            };

            /**
                @ngdoc method
                @name WebSocketFactory#statusAsText
                @param {string} itemId The id of the item
                @description Returns WebSocket connection status as text.
            */
            factory.statusAsText = function() {
                        var readyState = factory.status();
                        if (readyState === WebSocket.CONNECTING){
                                return WEBSOCKETS_CONFIG.CONNECTING;
                        } else if (readyState === WebSocket.OPEN){
                                return WEBSOCKETS_CONFIG.OPEN;
                        } else if (readyState === WebSocket.CLOSING){
                                return WEBSOCKETS_CONFIG.WS_CLOSING;
                        } else if (readyState === WebSocket.CLOSED){
                                return WEBSOCKETS_CONFIG.WS_CLOSED;
                        } else {
                                return WEBSOCKETS_CONFIG.WS_UNKNOWN;
                        }
            };


            return factory;
    }]);


})();