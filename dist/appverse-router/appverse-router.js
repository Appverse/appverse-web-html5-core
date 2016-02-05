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

    .config(["$urlRouterProvider", "ROUTER_CONFIG", function($urlRouterProvider, ROUTER_CONFIG) {

        if (ROUTER_CONFIG.loadStatesEnabled) {
            $urlRouterProvider.deferIntercept();
        }
    }]);
})();

(function() {
    'use strict';

    angular.module('appverse.router')

    .run(["$log", "$rootScope", "$state", "$stateParams", "ROUTER_CONFIG", "avStates", function($log, $rootScope, $state, $stateParams, ROUTER_CONFIG, avStates) {

        $log.debug('appverse.router run');

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        if (ROUTER_CONFIG.autoLoadStates) {
            avStates.loadStates();
        }
    }]);
})();

(function() {
    'use strict';

    angular.module('appverse.router')

    .provider('avStates', ["$stateProvider", function($stateProvider) {

        this.$get = ["$log", "$http", "ROUTER_CONFIG", "REST_CONFIG", "$urlRouter", function($log, $http, ROUTER_CONFIG, REST_CONFIG, $urlRouter) {

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
        }];
    }]);
})();
