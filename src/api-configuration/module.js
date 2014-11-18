(function() { 'use strict';

/**
 * @ngdoc module
 * @name AppConfiguration
 * @requires AppDetection
 * @description
 * It includes constants for all the common API components.
 */
angular.module('AppConfiguration', ['AppConfigLoader'])
    .run(run);

function run($log) {
    $log.info('AppConfiguration run');
}

})();