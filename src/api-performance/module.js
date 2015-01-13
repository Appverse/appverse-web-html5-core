(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name AppPerformance
     * @requires AppConfiguration
     * @description
     * The AppPerformance provides services to handle usage of several performance elements:
     * 1. Webworkers. Multithreaded-parallelized execution of tasks separated of the main JavaScript thread.
     * 2. High Performance UI directives support.
     */
    angular.module('AppPerformance', ['AppConfiguration'])
        .run(run);

    function run ($log) {
        $log.info('AppPerformance run');
    }

})();