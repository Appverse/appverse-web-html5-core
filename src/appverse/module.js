(function () {
    'use strict';

    /**
     * @ngdoc module
     * @name  appverse
     * @description Main module. Bootstraps the application by integrating services that have any relation.
     * It will automatically initialize any of these modules, whose scripts have been loaded:
     * * Bootstrap-based styling and gadgets
     * * Routing
     * * External Configuration
     * * REST Integration
     * * Cache Service
     * * ServerPush
     * * Security
     * * Internationalization
     * * Logging
     *
     * @requires  appverse.utils
     * @requires  appverse.configuration
     */

    /**
     * Main module.
     * Bootstraps the application by integrating services that have any relation.
     */
    angular.module('appverse', ['appverse.utils', 'appverse.configuration'])
        .config(config).run(run);

    /**
     * Preliminary configuration.
     *
     * Configures the integration between modules that need to be integrated
     * at the config phase.
     */
    function config($compileProvider) {

        // sanitize hrefs
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|itms-services):/);
    }

    function run($log, REST_CONFIG, $provide, ModuleSeekerProvider, $injector) {
        
        // Integrate modules that have a dependency
        if (ModuleSeekerProvider.exists('appverse.detection')) {
            var detectionProvider = $injector.get('DetectionProvider');
            var configLoaderProvider = $injector.get('ConfigLoaderProvider');
            configLoaderProvider.setDetection(detectionProvider);

            if (ModuleSeekerProvider.exists('appverse.logging')) {
                var formattedLoggerProvider = $injector.get('FormattedLoggerProvider');
                formattedLoggerProvider.setDetection(detectionProvider);
            }
        }
    }

})();