(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.performance
     * @requires AppConfiguration
     * @description
     * The appverse.performance provides services to handle usage of several performance elements:
     * 1-Webworkers. Multithreaded-parallelized execution of tasks separated of the main JavaScript thread.
     * 2-High Performance UI directives support.
     */
    angular.module('appverse.performance', ['AppConfiguration'])
        .run(run);

    function run ($log) {
        $log.info('appverse.performance run');
    }

})();