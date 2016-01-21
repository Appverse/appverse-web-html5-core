(function() {
    'use strict';

    /**
     * @ngdoc module
     * @name appverse.detection
     *
     * @description
     * Provides browser and network detection.
     */
    angular.module('appverse.detection', [
        'appverse.utils',
        'appverse.detection.mobile',
        'appverse.detection.provider'
    ]);

})();
