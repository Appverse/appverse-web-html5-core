(function () {
    'use strict';

    angular.module('appverse.router')

    .run(function ($log, $rootScope, $state, $stateParams, ROUTER_CONFIG, avStates) {

        $log.debug('appverse.router run');

        // It's very handy to add references to $state and $stateParams to the $rootScope
        // so that you can access them from any scope within your applications.For example,
        // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
        // to active whenever 'contacts.list' or one of its decendents is active.
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        if (ROUTER_CONFIG.loadStatesEnabled && ROUTER_CONFIG.autoLoadStates) {
            avStates.loadStates();
        }
    });
})();
