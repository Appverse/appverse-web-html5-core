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

    .run(["$log", function ($log) {
        $log.info('appverse.serverPush run');
    }]);

})();
/*globals SockJS:false, Stomp:false, MozWebSocket:false */
(function() {
    'use strict';

    angular.module('appverse.serverPush')

    /**
     * @ngdoc service
     * @name WebSocketFactory
     * @module appverse.serverPush
     *
     * @requires https://docs.angularjs.org/api/ngMock/service/$log $log
     * @requires WEBSOCKETS_CONFIG
     */
    .factory('WebSocketFactory',
        ["$log", function($log) {

            var WEBSOCKETS_CONFIG = angular.injector(['appverse.configuration.default']).get('WEBSOCKETS_CONFIG');

            var factory = {};

            /**
                @ngdoc method
                @name WebSocketFactory#open
                @param {string} itemId The id of the item
                @description Establishes a connection to a swebsocket endpoint.
            */
            factory.open = function(url, onmessage, onopen, onerror, onclose) {

                if (factory.ws) {
                    $log.warn('WebSocket connection is already opened. Closing it before opening a new one.');
                    factory.close().then(function() {
                        factory.open(url, onmessage, onerror, onclose);
                    });
                    return;
                }

                var ws = null;

                if (!url) {
                    url = WEBSOCKETS_CONFIG.WS_URL;
                }

                if (WEBSOCKETS_CONFIG.WS_TYPE === 'auto') {
                    //check if SockJS is avaiable
                    if ('SockJS' in window) {
                        ws = new SockJS(url);
                    }
                } else if (WEBSOCKETS_CONFIG.WS_TYPE === 'sockjs') {
                    ws = new SockJS(url);
                }

                //otherwise switches to HTML5 WebSocket native object
                if (ws === null) {
                    $log.debug('WS_TYPE: native');
                    if ('WebSocket' in window) {
                        ws = new WebSocket(url);
                    } else if ('MozWebSocket' in window) {
                        ws = new MozWebSocket(url);
                    }
                } else {
                    $log.debug('WS_TYPE: sockjs');
                }

                ws.onopen = function() {
                    if (ws !== null) {
                        ws.send('');
                    }
                    if (onopen) {
                        onopen();
                    }
                };

                ws.onerror = function(event) {
                    if (onerror) {
                        onerror(event);
                    }
                };

                ws.onmessage = function(message) {
                    if (onmessage) {
                        onmessage(message);
                    }
                };

                ws.onclose = function() {
                    if (onclose) {
                        onclose();
                    }
                };

                factory.ws = ws;
            };

            /**
                   @ngdoc method
                   @name WebSocketFactory#close
                   @param {string} itemId The id of the item
                   @description Close the WebSocket connection.
               */
            factory.close = function() {
                if (factory.ws) {
                    factory.ws.close();
                    factory.ws = null;
                }
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
                @name WebSocketFactory#status
                @param {string} itemId The id of the item
                @description WebSocket connection status.
                @returns websocket status code
            */
            factory.status = function() {
                if (factory.ws === null || angular.isUndefined(factory.ws)) {
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
                if (readyState === WebSocket.CONNECTING) {
                    return WEBSOCKETS_CONFIG.CONNECTING;
                } else if (readyState === WebSocket.OPEN) {
                    return WEBSOCKETS_CONFIG.OPEN;
                } else if (readyState === WebSocket.CLOSING) {
                    return WEBSOCKETS_CONFIG.WS_CLOSING;
                } else if (readyState === WebSocket.CLOSED) {
                    return WEBSOCKETS_CONFIG.WS_CLOSED;
                } else {
                    return WEBSOCKETS_CONFIG.WS_UNKNOWN;
                }
            };


            /**
                @ngdoc method
                @name WebSocketFactory#connect
                @param {object} username
                @param {object} password
                @param {object} onconnectcallback
                @description Stablishes a protocol connection over a websocket connection
            */
            factory.connect = function(login, passcode, connectCallback, errorCallback, debugFunction) {

                if (factory.client) {
                    $log.warn('Client already exists. Please disconnect it before reconnecting.');
                    return;
                }
                if (WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'none') {
                    $log.warn('No protocol configured WS_PROTOCOL_TYPE=none');
                    throw new TypeError('No protocol configured WS_PROTOCOL_TYPE=none');
                }
                if (!factory.ws) {
                    $log.debug('No underlying WebSocket connection found. Opening default one...');
                    factory.open(null, null, function() {
                        factory.connect(login, passcode, connectCallback, errorCallback);
                    });
                    return;
                }
                var client = null;
                //protocol
                if (WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'auto' ||
                    WEBSOCKETS_CONFIG.WS_PROTOCOL_TYPE === 'stomp') {
                    if ('Stomp' in window) {
                        client = Stomp.over(factory.ws);

                        $log.debug('WS_TYPE: sockjs');
                        //configure
                        if (WEBSOCKETS_CONFIG.HEARTBEAT_OUTGOING !== null) {
                            client.heartbeat.outgoing = WEBSOCKETS_CONFIG.HEARTBEAT_OUTGOING;
                        }
                        if (WEBSOCKETS_CONFIG.HEARTBEAT_INCOMING !== null) {
                            client.heartbeat.incoming = WEBSOCKETS_CONFIG.HEARTBEAT_INCOMING;
                        }

                        client.debug = debugFunction;

                        //Establish connection
                        client.connect(login, passcode, connectCallback, errorCallback);
                    } else {
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
            factory.subscribe = function(destination, callback, headers) {
                if (!factory.client) {
                    $log.debug('Client does not exists. Connecting to default one...');
                    factory.connect();
                }
                if (typeof callback !== "function") {
                    throw new TypeError(callback + " is not a function.");
                }
                return factory.client.subscribe(destination, callback, headers);
            };

            /**
                @ngdoc method
                @name WebSocketFactory#send
                @param {object} queueName String that represents the endpoint queue name.
                @param {object} headers special headers.
                @param {object} message .
                @description Send a protocol message to the server.
            */
            factory.send = function(queueName, headers, message) {
                if (factory.client === null || angular.isUndefined(factory.client)) {
                    $log.warn('Client does not exists. Please connect first.');
                    return;
                }
                factory.client.send(queueName, headers, message);
            };
            /**
                @ngdoc method
                @name WebSocketFactory#unsubscribe
                @param {object} subscription subscription object provided on subscribe.
                @description Unsubscribe to an specific queue on server side.

            */
            factory.unsubscribe = function(subscription) {
                if (!subscription || angular.isUndefined(subscription)) {
                    $log.warn('Subscription missing. Please provide the subcription object you got when subscribing.');
                    return;
                }
                subscription.unsubscribe();
            };

            /**
                @ngdoc method
                @name WebSocketFactory#disconnect
                @description Disconnects a protocol connection over a websocket connection
            */
            factory.disconnect = function() {
                if (!factory.client || angular.isUndefined(factory.client)) {
                    $log.warn('Client does not exists, please connect first.');
                    return;
                }
                factory.client.disconnect();
                factory.client = null;
            };

            return factory;
        }]
    );


})();
