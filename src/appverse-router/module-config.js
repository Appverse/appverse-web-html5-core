(function() {
    'use strict';

    angular.module('appverse.router')

    .config(function($urlRouterProvider, ROUTER_CONFIG) {

        if (ROUTER_CONFIG.loadStatesEnabled) {
            $urlRouterProvider.deferIntercept();
        }
    });
})();
