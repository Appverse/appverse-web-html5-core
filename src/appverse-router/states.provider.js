(function() {
    'use strict';

    angular.module('appverse.router')

    .provider('avStates', function($stateProvider) {

        this.$get = function($log, $http, ROUTER_CONFIG, REST_CONFIG, $urlRouter) {

            return {
                loadStates: function(promise) {

                    if (promise) {
                        $log.debug('Promise detected. It will be used to load states.');
                    } else {
                        var url = ROUTER_CONFIG.statesUrl;

                        if (ROUTER_CONFIG.prependBaseUrl) {
                            url = REST_CONFIG.BaseUrl + url;
                        }

                        if (ROUTER_CONFIG.appendRequestSuffix) {
                            url += REST_CONFIG.RequestSuffix;
                        }

                        $log.debug('Getting states from ' + url);
                        promise = $http.get(url);
                    }

                    promise.then(function(response) {

                        $log.debug('States promise response', response);

                        if (ROUTER_CONFIG.responsePath !== "") {
                            angular.forEach(ROUTER_CONFIG.responsePath.split('.'), function(path) {
                                response = response[path];
                            });
                        }

                        angular.forEach(response, function(state) {
                            $log.debug('Adding state:', state.name);
                            $stateProvider.state(state.name, state.config);
                        });

                        $urlRouter.listen();
                        $urlRouter.sync();
                    });
                }
            };
        };
    });
})();
