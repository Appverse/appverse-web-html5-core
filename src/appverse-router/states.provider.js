(function() {
    'use strict';

    angular.module('appverse.router')

    .provider('avStates', function($stateProvider) {

        var provider = this;
        provider.stateFunctions = {};
        provider.globalFunctions = {};

        provider.setFunction = function(functionName, functionObject, stateName) {
            if (stateName) {
                if (!provider.stateFunctions[stateName]) {
                    provider.stateFunctions[stateName] = {};
                }
                provider.stateFunctions[stateName][functionName] = functionObject;
            } else {
                provider.globalFunctions[functionName] = functionObject;
            }
        };

        provider.$get = function($log, $http, ROUTER_CONFIG, REST_CONFIG, $urlRouter) {

            return {
                loadStates: function(statesObject) {

                    if (statesObject) {
                        $log.debug('States object detected. It will be used to load states.');
                        parseStates(statesObject);
                    } else {
                        var url = ROUTER_CONFIG.statesUrl;

                        if (ROUTER_CONFIG.prependBaseUrl) {
                            url = REST_CONFIG.BaseUrl + url;
                        }

                        if (ROUTER_CONFIG.appendRequestSuffix) {
                            url += REST_CONFIG.RequestSuffix;
                        }

                        $log.debug('Getting states from ' + url);
                        $http.get(url).then(function(response) {
                            parseStates(response.data);
                        });
                    }

                    $urlRouter.listen();

                    function parseStates(statesObject) {

                        $log.debug('States object', statesObject);

                        angular.forEach(statesObject, function(stateConfig, stateName) {

                            $log.debug('Adding state:', stateName);

                            angular.forEach(provider.globalFunctions, function(value, key) {
                                stateConfig[key] = value;
                            });

                            if (provider.stateFunctions) {
                                angular.forEach(provider.stateFunctions[stateName], function(value, key) {
                                    stateConfig[key] = value;
                                });
                            }

                            $stateProvider.state(stateName, stateConfig);
                        });

                        $urlRouter.sync();
                    }
                }
            };
        };
    });
})();
