(function() { 'use strict';

/**
 * @ngdoc module
 * @name appverse.configuration
 * @requires AppDetection
 * @description
 * It includes constants for all the common API components.
 */
angular.module('appverse.configuration', ['appverse.configuration.loader'])
    .run(run);

function run($log) {
    $log.info('appverse.configuration run');
}

})();