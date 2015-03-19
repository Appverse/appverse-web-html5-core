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
                if (angular.isUndefined(url)) {
                    url = WEBSOCKETS_CONFIG.WS_URL;
                }
                
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
                ws.onopen = function (event) {
                    if (ws !== null) {
                        ws.send('');
                        factory.callback(event,WEBSOCKETS_CONFIG.WS_CONNECTED);
                    } else {
                        factory.callback(event, WEBSOCKETS_CONFIG.WS_DISCONNECTED);
                     }
                };

                ws.onerror = function(event) {
                  factory.callback(event, WEBSOCKETS_CONFIG.WS_FAILED_CONNECTION);
                };

                ws.onmessage = function(message) {
                  factory.onmessagecallback(message);
                };

                ws.onclose = function () {
                    if (ws !== null) {
                        ws.close();
                        ws = null;
                    }
                };

                factory.ws = ws;
            };
            factory.onprotocolconnectcallback = function(event) {
              factory.callback(event, WEBSOCKETS_CONFIG.WS_PROTOCOL_CONNECTED);
            };
            factory.onprotocoldisconnectcallback = function(event) {
              factory.callback(event,WEBSOCKETS_CONFIG.WS_PROTOCOL_DISCONNECTED);
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
                        if (factory.ws !== null && !angular.isUndefined(factory.ws)){
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
                        if (!angular.isUndefined(onconnectcallback)){
                            client.connect(user, password, onconnectcallback, factory.onprotocoldisconnectcallback);  
                        }else{
                            client.connect(user, password, factory.onprotocolconnectcallback, 
                                factory.onprotocoldisconectcallback, factory.onprotocoldisconnectcallback);
                        }
                        client.disconect(factory.onprotocoldisconnectcallback);
                    }else{
                        $log.debug('WS_TYPE: none');
                    }
                }
                factory.client = client;
            };
            /**
                @ngdoc method
                @name WebSocketFactory#subscribe
                @param {object} queueName String that represents the endpoint queue name.
                @param {object} callback .
                @description Subscribe to an specific queue on server side.
                @returns subscription variable (required to unsubscribe)
                
            */
            factory.subscribe = function(queueName, callback){
                if(factory.client === null || angular.isUndefined(factory.client)) {
                    $log.warn('factory.client does not exists');
                    return null;
                }
                return factory.client.subscribe(queueName, callback);
            };
            
             /**
                @ngdoc method
                @name WebSocketFactory#send
                @param {object} queueName String that represents the endpoint queue name.
                @param {object} headers special headers.
                @param {object} message .
                @description Send a protocol message to the server.
            */            
            factory.send = function(queueName, headers, message){
                if(factory.client === null || angular.isUndefined(factory.client)) {
                    $log.warn('factory.client does not exists');
                    return ;
                }
                client.send(queueName, headers, message);
            };
             /**
                @ngdoc method
                @name WebSocketFactory#unsubscribe
                @param {object} subscription subscription object provided on subscribe.
                @description Unsubscribe to an specific queue on server side.
                
            */
            factory.unsubscribe = function(subscription){
                if(!subscription || angular.isUndefined(subscription)) {
                    $log.warn('subscription does not exists');
                    return;
                }                
                subscription.unsubscribe();
            };
            
            /**
                @ngdoc method
                @name WebSocketFactory#disconnect                
                @description Disconnects a protocol connection over a websocket connection
            */
            factory.disconnect = function(){
                if(!factory.client || angular.isUndefined(factory.client)) {
                    $log.warn('factory.client does not exists');
                    return;
                }
                factory.client.disconnect();
            };
            

            /**
                @ngdoc method
                @name WebSocketFactory#sendRaw
                @param {object} message Message payload in JSON format.
                @description Send a raw message to the ws server (without protocol).
            */
            factory.sendRaw = function(message) {
              $log.debug('factory.ws: ' + factory.ws);
              factory.ws.send(message);
            };
            /**
                @ngdoc method
                @name WebSocketFactory#onmessage
                @param {object} callback .
                @description Retrieve a raw message of the websocket connection.
            */
            factory.onmessage = function(callback) {
              factory.onmessagecallback = callback;
            };
            /**
                @ngdoc method
                @name WebSocketFactory#onstatuschanged
                @param {object} callback .
                @description Retrieve the websocket changes of status.
            */
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
                if (factory.ws){
                    factory.ws.close();
                }
            };



             /**
                @ngdoc method
                @name WebSocketFactory#status
                @param {string} itemId The id of the item
                @description WebSocket connection status.
                @returns websocket status code
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
                @returns status text
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