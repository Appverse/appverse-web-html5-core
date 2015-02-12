(function() { 'use strict';

/**
 * @ngdoc module
 * @name appverse.configuration
 * @requires appverse.detection
 * @description
 * It includes constants for all the common API components. This module is initially empty.
 * When the application bootstraps, it is populated with the combination of default and custom configuration values
 *
 * @requires appverse.configuration.loader
 */
angular.module('appverse.configuration', ['appverse.configuration.loader'])
    .run(run);

function run($log) {
    $log.info('appverse.configuration run');
}

})();