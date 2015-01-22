(function() {
    'use strict';

    /**
     * Define states and routes here
     */
    var states = {

        home : {
            url: '/home',
            templateUrl: 'partials/home.html',
        },

        rest : {
            url: "/rest",
            templateUrl: 'partials/rest.html',
            controller: 'RestController'
        },

        detection : {
            url: "/detection",
            templateUrl: 'partials/detection.html',
            controller: 'DetectionController'
        },

        cache : {
            url: "/cache",
            templateUrl: 'partials/cache.html',
            controller: 'CacheController'
        },

        'cache.state1' : {
            url: '/state1',
            templateUrl: 'partials/cache.state1.html',
        },

        'cache.state2' : {
            url: '/state2',
            templateUrl: 'partials/cache.state2.html',
        },

        'cache.simpleidb' : {
            url: '/simpleidb',
            templateUrl: 'views/cache/cache.simpleidb.html',
            controller: 'simpleIDBController'
        },

        performance : {
            url: "/performance",
            templateUrl: 'partials/performance.html',
            controller: 'PerformanceController'
        },

        internationalization : {
            url: "/i18n",
            templateUrl: 'partials/internationalization.html',
            controller: 'I18nController'
        },

        websockets : {
            url: '/websockets',
            templateUrl: 'partials/websockets.html',
            controller: 'WebSocketsController'
        },
    };

    /**
     * Default route to use when invalid routes are requested
     */
    var defaultRoute = '/home';

    configureMainModuleToAddStates();


    function configureMainModuleToAddStates() {
        angular
            .module('demoApp')
            .config(defineStates);
    }

    /**
     * Defines states associated to routes in the app.
     * Parameters are resolved and injected by Angular DI
     */
    function defineStates($stateProvider, $urlRouterProvider) {
        ifNoRouteThenGoTo(defaultRoute);

        Object.keys(states)
            .forEach(addState);

        function addState(stateName) {
            $stateProvider.state(stateName, states[stateName]);
        }

        function ifNoRouteThenGoTo(route) {
            $urlRouterProvider.otherwise(route);
        }
    }

})();