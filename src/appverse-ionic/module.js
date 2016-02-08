(function () {
    'use strict';

    var requires = [
        'ionic',
        'appverse.detection',
        'ui.router',
        'appverse.ionic.templates'
    ];


    /**
     * @ngdoc module
     * @name appverse.ionic
     *
     * @description
     * Provides ionic management views
     *
     * @requires appverse.detection
     * @requires ui.router
     * @requires ui.bootstrap
     */

    angular.module('appverse.ionic', requires);
})();
