(function() {
    'use strict';

    angular.module('demoApp').config(defineStates);

    /**
     * Defines states associated to routes in the app.
     * Parameters are resolved and injected by Angular DI
     */
    function defineStates($stateProvider, $urlRouterProvider) {

        goToHomePageIfRouteDoesNotExist();

        $stateProvider.state("rest", {
            url: "/rest",
            templateUrl: 'partials/rest.html',
            controller: 'RestController'
        });

        $stateProvider.state("home", {
            url: "/home",
            templateUrl: 'partials/home.html',
        });

        function goToHomePageIfRouteDoesNotExist() {
             $urlRouterProvider.otherwise('/home');
        }
    }




})();