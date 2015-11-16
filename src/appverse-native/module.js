/*globals AppverseEmulator, get_params:false, unescape:false */
(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.native
     *
     * @description
     * Provides native utilities using Appverse mobile
     *
     * @requires appverse.detection
     */
    angular.module('appverse.native', ['appverse.detection'])

    .config(
        function ($httpProvider, DetectionProvider, REST_CONFIG) {

            function createMap() {
                return Object.create(null);
            }

            var trim = function (value) {
                return angular.isString(value) ? value.trim() : value;
            };

            function parseHeaders(headers) {
                var parsed = createMap(),
                    key, val, i;

                if (!headers) {
                    return parsed;
                }

                angular.forEach(headers.split('\n'), function (line) {
                    i = line.indexOf(':');
                    key = angular.lowercase(trim(line.substr(0, i)));
                    val = trim(line.substr(i + 1));

                    if (key) {
                        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
                    }
                });

                return parsed;
            }

            function headersGetter(headers) {
                var headersObj = angular.isObject(headers) ? headers : undefined;

                return function (name) {
                    if (!headersObj) {
                        headersObj = parseHeaders(headers);
                    }

                    if (name) {
                        var value = headersObj[angular.lowercase(name)];
                        if (value === void 0) {
                            value = null;
                        }
                        return value;
                    }

                    return headersObj;
                };
            }

            window.$httpCounter = -1;

            window.$httpCallback = function (result, id) {

                console.log('$httpCallback', id);
                console.log('$httpCallback', result);

                var response = {};
                response.config = window['$httpConfig' + id];
                delete window['$httpConfig' + id];

                if (result !== null) {
                    var headers = '';
                    angular.forEach(result.Headers, function (header) {
                        headers += header.Name + ':' + header.Value + '\n';
                    });

                    response.headers = headersGetter(headers);

                    if (result.Content.length > 0) {
                        response.data = JSON.parse(result.Content);
                    }
                    response.status = 200;
                    response.statusText = "OK";

                    if (response.config.cache && $httpProvider.defaults.cache && response.config.method === 'GET') {
                        $httpProvider.defaults.cache.put(response.config.url, [response.status, response.data, response.headers(), response.statusText]);
                    }

                    window['$httpPromise' + id].resolve(response);
                } else {
                    response.status = 404;
                    response.statusText = "Error";

                    window['$httpPromise' + id].reject(response);
                }
                delete window['$httpPromise' + id];
            };

            var setIoService = function (config) {
                var ioService = {};
                ioService.Endpoint = {};
                ioService.Endpoint.Path = config.url.split(REST_CONFIG.BaseUrl)[1];

                if (!REST_CONFIG.HostList[config.ind]) {
                    console.error("Host not found in Host list: ", REST_CONFIG.HostList);
                } else {
                    ioService.Endpoint.Host = REST_CONFIG.HostList[config.ind].Host;
                    ioService.Endpoint.Port = REST_CONFIG.HostList[config.ind].Port;
                }

                if (REST_CONFIG.ServerMode === 'MockServer') {
                    ioService.Endpoint.ProxyUrl = REST_CONFIG.MockServer.URL + ':' + REST_CONFIG.MockServer.Port;
                } else {
                    ioService.Endpoint.ProxyUrl = "";
                }

                return ioService;
            };

            var setRequestObject = function (config) {
                var request = {};
                request.Headers = [];

                //Pending Appverse Mobile format
                //            angular.forEach(config.headers, function(value, header) {
                //                request.Headers.push({
                //                    Name: header,
                //                    Value: value
                //                })
                //            });

                request.Content = config.data;
                request.ContentType = "application/json";
                request.Session = {};
                request.Method = config.method;
                request.StopAutoRedirect = false;

                return request;
            };

            $httpProvider.interceptors.push(function ($q) {
                return {
                    request: function (config) {

                        if (config.url.indexOf(REST_CONFIG.BaseUrl) !== 0 || !DetectionProvider.hasAppverseMobile()) {
                            console.log('request fallthrough', config);
                            return config;
                        }

                        if (config.cache && config.method === 'GET' && $httpProvider.defaults.cache && $httpProvider.defaults.cache.get(config.url)) {
                            console.log('request cached', config);
                            return config;
                        }

                        console.log('request override', config);

                        window.$httpCounter++;
                        window['$httpPromise' + window.$httpCounter] = $q.defer();
                        window['$httpConfig' + window.$httpCounter] = angular.copy(config);

                        var methodName = "InvokeService";
                        var callBackFuncName = "$httpCallback";
                        var callbackId = window.$httpCounter;

                        if (!config.ind) {
                            config.ind = 0;
                        }

                        var params = get_params([setRequestObject(config), setIoService(config)]);

                        var legacyPath = Appverse.SERVICE_URI + Appverse.IO.serviceName + "/" + methodName;
                        var newPath = Appverse.APPVERSE_SERVICE_URI + Appverse.IO.serviceName + "/" + methodName; // new path for Appverse 5.0 (applied when possible)

                        var path = legacyPath; // by default, use legacy path

                        if (Appverse.is.iOS) {
                            path = newPath; // we use the new path for all iOS devices
                        }

                        var reqData = "";

                        if (callBackFuncName !== null) {
                            reqData = reqData + "callback=" + callBackFuncName;
                        } else {
                            reqData = reqData + "callback=NULL";
                        }
                        if (callbackId !== null) {
                            reqData = reqData + "&callbackid=" + callbackId;
                        } else {
                            reqData = reqData + "&callbackid=callbackid";
                            callbackId = "callbackId";
                        }

                        if (params !== null) {
                            //reqData = reqData + "&json=" + unescape(params);
                            if (Appverse.unescapeNextRequestData) {
                                reqData = reqData + "&json=" + unescape(params);
                            } else {
                                reqData = reqData + "&json=" + params; // we don't unscape parameters if configured
                                Appverse.unescapeNextRequestData = true; // returning to default configuration value
                            }
                        }

                        if (window.webkit) {
                            // using new WKWebView message handlers, if available (iOS 8)
                            window.webkit.messageHandlers.service.postMessage({
                                uri: path,
                                query: reqData
                            });
                            return;
                        }

                        if (window.appverseJSBridge) { // only available for 4.2+ Android devices
                            path = newPath;
                            window.appverseJSBridge.postMessage(path, reqData);
                            return;
                        }

                        if (window.external && window.external.notify) { // using external post notifications for Windows Phone
                            var t = {
                                uri: newPath,
                                query: reqData
                            };
                            window.external.notify(JSON.stringify(t));
                            return;
                        }

                        if (AppverseEmulator.eventListenersRegistered && AppverseEmulator.eventListenersRegistered.indexOf(methodName) >= 0) {
                            AppverseEmulator.queuedListenerMessagesCount++;
                            console.log("Appverse Emulator - queue listener result for methodName: " + AppverseEmulator.normalizeListenerCallingName(methodName));

                            (function (smn) {
                                setTimeout(function () {
                                    AppverseEmulator.appverseListenerPollingTimerFunc(smn);
                                }, AppverseEmulator.pollingInterval);
                            })(Appverse.IO.serviceName + "#" + AppverseEmulator.normalizeListenerCallingName(methodName));
                        }

                        if (Appverse.executingInEmulator) {
                            if (callBackFuncName !== null) {
                                AppverseEmulator.queuedCallbackMessagesCount++;
                                console.log("Appverse Emulator - queue callback result for methodName: " + methodName);
                                (function (c, ci) {
                                    setTimeout(function () {
                                        AppverseEmulator.appverseCallbackPollingTimerFunc(c, ci);
                                    }, AppverseEmulator.pollingInterval);
                                })(callBackFuncName, callbackId);
                            }
                        }

                        delete config.headers.Accept;
                        config.headers['Content-Type'] = 'application/json;charset=UTF-8';
                        config.method = 'POST';
                        config.url = path;
                        config.data = reqData;

                        return config;
                    },
                    response: function (response) {

                        if (!response.config.url || response.config.url.indexOf(Appverse.SERVICE_URI + Appverse.IO.serviceName + "/InvokeService") !== 0) {
                            return response;
                        }

                        console.log('response override', response);

                        var counter = response.config.data.split('callbackid=')[1].split('&')[0];
                        return window['$httpPromise' + counter].promise;
                    }
                };
            });

        });


})();
