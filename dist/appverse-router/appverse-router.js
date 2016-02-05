(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.router
     * @description Adds routing capabilities to the application
     *
     * @requires https://github.com/angular-ui/ui-router ui.router
     */
    angular.module('appverse.router', [
        'ui.router',
        'appverse.configuration.default'
    ]);
})();

(function() {
    'use strict';

    angular.module('appverse.router')

    .provider('dynamicStates', ["$stateProvider", function($stateProvider) {

        var provider = this;

        provider.$get = function() {
            return {
                addState: function(name, state) {
                    $stateProvider.state(name, state);
                },
                setPromise: function(promise) {
                    provider.promise = promise;
                },
                getPromise: function() {
                    return provider.promise;
                }
            };
        };
    }]);
})();

(function() {
    'use strict';

    angular.module('appverse.router')

    .run(["$log", "$rootScope", "$state", "$stateParams", "ROUTER_CONFIG", "$http", "dynamicStates", function($log, $rootScope, $state, $stateParams, ROUTER_CONFIG, $http, dynamicStates) {

        $log.debug('appverse.router run');

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        if (ROUTER_CONFIG.loadStates) {

            var promise = dynamicStates.getPromise();

            if (!promise) {
                var url = ROUTER_CONFIG.statesUrl;

                if (ROUTER_CONFIG.prependBaseUrl) {
                    url = angular.injector(['appverse.configuration.default']).get('REST_CONFIG').BaseUrl + url;
                }

                if (ROUTER_CONFIG.appendRequestSuffix) {
                    url += angular.injector(['appverse.configuration.default']).get('REST_CONFIG').RequestSuffix;
                }

                promise = $http.get(url);
            }

            promise.then(function(response) {

                angular.forEach(ROUTER_CONFIG.responsePath.split('.'), function(path) {
                    response = response[path];
                });

                angular.forEach(response, function(state) {
                    dynamicStates.addState(state.name, state.config);
                });
            });
        }
    }]);
})();
